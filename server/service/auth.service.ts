import bcrypt from 'bcrypt'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import type {
  RegisterRequestDto,
  LoginRequestDto,
  AuthResponseDto,
  UserResponseDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  EmailValidationRequestDto,
  UpdateProfileRequestDto,
} from '../dto/auth.dto'
import { UserMapper } from '../mapper/user.mapper'
import { userRepository } from '../repository/user.repository'
import { tokenService } from './token.service'
import { emailService } from './email.service'
import { uploadService } from './upload.service'
import { generateSecureToken, hashToken } from '../utils/crypto'
import { logger } from '../utils/logger'
import { sentry } from '../utils/sentry'

const SALT_ROUNDS = 12
const EMAIL_VERIFY_HOURS = 24
const RESET_PASSWORD_HOURS = 1

export class AuthService {
  async register(
    dto: RegisterRequestDto,
    profilePicBuffer?: Buffer,
    profilePicName?: string,
  ): Promise<AuthResponseDto> {
    logger.info(`Processing registration for email: ${dto.email}`)

    const existingEmail = await userRepository.findByEmail(dto.email)
    if (existingEmail) {
      logger.warn(`Registration conflict: Email ${dto.email} already in use`)
      throw createError({ statusCode: 409, statusMessage: 'Email already in use' })
    }

    const existingPhone = await userRepository.findByPhone(dto.phone)
    if (existingPhone) {
      logger.warn(`Registration conflict: Phone ${dto.phone} already in use`)
      throw createError({ statusCode: 409, statusMessage: 'Phone number already in use' })
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS)

    let profilePictureUrl: string | undefined
    if (profilePicBuffer && profilePicName) {
      try {
        profilePictureUrl = await uploadService.processProfilePicture(
          profilePicBuffer,
          profilePicName,
        )
      } catch (err) {
        sentry.captureException(err)
      }
    }

    const rawVerifyToken = generateSecureToken()
    const hashedVerifyToken = hashToken(rawVerifyToken)
    const verifyExpires = new Date(Date.now() + EMAIL_VERIFY_HOURS * 60 * 60 * 1000)

    const isDev = process.env.NODE_ENV !== 'production'

    const user = await userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      age: dto.age,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      profilePictureUrl,
      emailVerifyToken: hashedVerifyToken,
      emailVerifyExpires: verifyExpires,
      emailVerified: isDev, // Auto-verify in development for instant login without Resend setup
    })

    await emailService.sendVerificationEmail(user.email, user.firstName, rawVerifyToken)

    const accessToken = tokenService.generateAccessToken(user.id)
    const refreshToken = tokenService.generateRefreshToken(user.id)

    const hashedRefresh = hashToken(refreshToken)
    await userRepository.updateRefreshToken(user.id, hashedRefresh)

    return {
      accessToken,
      user: UserMapper.toResponseDto(user),
    }
  }

  async login(dto: LoginRequestDto): Promise<AuthResponseDto & { refreshToken: string }> {
    logger.info(`Authenticating user: ${dto.email}`)

    const user = await userRepository.findByEmail(dto.email)
    if (!user) {
      logger.warn(`Login failed: User not found for ${dto.email}`)
      throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordMatch) {
      logger.warn(`Login failed: Invalid password for ${dto.email}`)
      throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
    }

    if (!user.emailVerified) {
      logger.warn(`Login blocked: Unverified email for ${dto.email}`)
      throw createError({
        statusCode: 403,
        statusMessage: 'Please verify your email address before logging in',
      })
    }

    const accessToken = tokenService.generateAccessToken(user.id)
    const refreshToken = tokenService.generateRefreshToken(user.id)

    const hashedRefresh = hashToken(refreshToken)
    await userRepository.updateRefreshToken(user.id, hashedRefresh)

    return {
      accessToken,
      refreshToken,
      user: UserMapper.toResponseDto(user),
    }
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await userRepository.findById(userId)
    if (!user) {
      logger.warn(`User ID not found in profile retrieval: ${userId}`)
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }
    return UserMapper.toResponseDto(user)
  }

  async logout(userId: string): Promise<void> {
    logger.info(`Logging out user ID: ${userId}`)
    await userRepository.updateRefreshToken(userId, null)
  }

  async verifyEmail(dto: EmailValidationRequestDto): Promise<{ message: string }> {
    logger.info('Processing email verification token')

    const hashedToken = hashToken(dto.token)
    const user = await userRepository.findByEmailVerifyToken(hashedToken)

    if (!user || !user.emailVerifyExpires || user.emailVerifyExpires < new Date()) {
      logger.warn('Email verification failed: Token is invalid or expired')
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired verification token',
      })
    }

    await userRepository.updateEmailVerified(user.id)
    logger.info(`User email verified successfully for user ID: ${user.id}`)
    return { message: 'Email verified successfully' }
  }

  async forgotPassword(dto: ForgotPasswordRequestDto): Promise<{ message: string }> {
    logger.info(`Password reset request received for email: ${dto.email}`)

    const user = await userRepository.findByEmail(dto.email)

    if (user) {
      const rawToken = generateSecureToken()
      const hashedToken = hashToken(rawToken)
      const expires = new Date(Date.now() + RESET_PASSWORD_HOURS * 60 * 60 * 1000)

      await userRepository.updateResetPasswordToken(user.id, hashedToken, expires)
      await emailService.sendPasswordResetEmail(user.email, user.firstName, rawToken)
      logger.info(`Password reset token sent to email: ${dto.email}`)
    } else {
      logger.info(`Password reset request ignored for non-existent email: ${dto.email}`)
    }

    return {
      message: 'If an account with that email exists, a password reset link has been sent',
    }
  }

  async resetPassword(dto: ResetPasswordRequestDto): Promise<{ message: string }> {
    logger.info('Executing password reset from token')

    const hashedToken = hashToken(dto.token)
    const user = await userRepository.findByResetPasswordToken(hashedToken)

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      logger.warn('Password reset failed: Reset token is invalid or expired')
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired reset token',
      })
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS)
    await userRepository.updatePassword(user.id, passwordHash)
    logger.info(`Password reset completed successfully for user ID: ${user.id}`)

    return { message: 'Password reset successfully' }
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileRequestDto,
    profilePicBuffer?: Buffer,
    profilePicName?: string,
  ): Promise<UserResponseDto> {
    logger.info(`Processing profile update for user ID: ${userId}`)

    const user = await userRepository.findById(userId)
    if (!user) {
      logger.warn(`User ID not found for profile update: ${userId}`)
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Check unique email constraint if updated
    if (dto.email && dto.email !== user.email) {
      const existingEmail = await userRepository.findByEmail(dto.email)
      if (existingEmail) {
        logger.warn(`Profile update conflict: Email ${dto.email} already in use`)
        throw createError({ statusCode: 409, statusMessage: 'Email already in use' })
      }
    }

    // Check unique phone constraint if updated
    if (dto.phone && dto.phone !== user.phone) {
      const existingPhone = await userRepository.findByPhone(dto.phone)
      if (existingPhone) {
        logger.warn(`Profile update conflict: Phone ${dto.phone} already in use`)
        throw createError({ statusCode: 409, statusMessage: 'Phone number already in use' })
      }
    }

    let profilePictureUrl: string | undefined
    if (profilePicBuffer && profilePicName) {
      try {
        // Optimize and save the new profile picture (like register API)
        profilePictureUrl = await uploadService.processProfilePicture(
          profilePicBuffer,
          profilePicName,
        )

        // Delete the old profile picture if it exists and is a local file
        if (user.profilePictureUrl && user.profilePictureUrl.startsWith('/uploads/avatars/')) {
          const oldFilePath = path.resolve('public', user.profilePictureUrl.replace(/^\//, ''))
          try {
            await fs.unlink(oldFilePath)
            logger.info(`Deleted old profile picture: ${oldFilePath}`)
          } catch (err: any) {
            // Log warning but don't fail the request if file is already missing
            logger.warn(`Failed to delete old profile picture ${oldFilePath}: ${err.message}`)
          }
        }
      } catch (err) {
        sentry.captureException(err)
      }
    }

    const updatedUser = await userRepository.updateProfile(userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      age: dto.age,
      email: dto.email,
      phone: dto.phone,
      ...(profilePictureUrl ? { profilePictureUrl } : {}),
    })

    return UserMapper.toResponseDto(updatedUser)
  }
}

export const authService = new AuthService()
