import type { H3Event } from 'h3'
import { authService } from '../service/auth.service'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  emailValidationSchema,
} from '../validations/auth.zod'
import type { ZodError } from 'zod'
import { logger } from '../utils/logger'
import { sentry } from '../utils/sentry'

function formatZodErrors(error: ZodError) {
  const errors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (!errors[key]) {
      errors[key] = []
    }
    errors[key]!.push(issue.message)
  }
  return errors
}

export class AuthController {
  async register(event: H3Event) {
    logger.info('Handling registration request')
    try {
      const formData = await readMultipartFormData(event)
      if (!formData) {
        logger.warn('Empty registration request body')
        throw createError({ statusCode: 400, statusMessage: 'Request body is required' })
      }

      const fields: Record<string, string> = {}
      let profilePicBuffer: Buffer | undefined
      let profilePicName: string | undefined

      for (const part of formData) {
        if (part.name === 'profilePicture' && part.filename) {
          profilePicBuffer = part.data
          profilePicName = part.filename
        } else if (part.name) {
          fields[part.name] = part.data.toString('utf-8')
        }
      }

      const result = registerSchema.safeParse({
        ...fields,
        age: fields.age ? Number(fields.age) : undefined,
      })

      if (!result.success) {
        logger.warn('Registration validation failed')
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const authResponse = await authService.register(
        result.data,
        profilePicBuffer,
        profilePicName,
      )

      setResponseStatus(event, 201)
      logger.info(`User registered successfully: ${result.data.email}`)
      return { success: true, data: authResponse }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) {
        throw error
      }
      sentry.captureException(error)
      throw error
    }
  }

  async login(event: H3Event) {
    logger.info('Handling login request')
    try {
      const body = await readBody(event)
      const result = loginSchema.safeParse(body)

      if (!result.success) {
        logger.warn('Login validation failed')
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const { accessToken, refreshToken, user } = await authService.login(result.data)

      setCookie(event, 'refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })

      logger.info(`User logged in successfully: ${result.data.email}`)
      return { success: true, data: { accessToken, user } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) {
        throw error
      }
      sentry.captureException(error)
      throw error
    }
  }

  async getMe(event: H3Event) {
    try {
      const userId = event.context.userId as string
      logger.info(`Fetching profile for user ID: ${userId}`)
      const user = await authService.getMe(userId)
      return { success: true, data: user }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) {
        throw error
      }
      sentry.captureException(error)
      throw error
    }
  }

  async logout(event: H3Event) {
    try {
      const userId = event.context.userId as string
      logger.info(`Logging out user ID: ${userId}`)
      await authService.logout(userId)
      deleteCookie(event, 'refresh_token', { path: '/' })
      return { success: true, data: { message: 'Logged out successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) {
        throw error
      }
      sentry.captureException(error)
      throw error
    }
  }

  async emailValidation(event: H3Event) {
    logger.info('Handling email validation request')
    try {
      const body = await readBody(event)
      const result = emailValidationSchema.safeParse(body)

      if (!result.success) {
        logger.warn('Email validation parameter failure')
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const data = await authService.verifyEmail(result.data)
      logger.info('Email verified successfully')
      return { success: true, data }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) {
        throw error
      }
      sentry.captureException(error)
      throw error
    }
  }

  async forgotPassword(event: H3Event) {
    logger.info('Handling forgot password request')
    try {
      const body = await readBody(event)
      const result = forgotPasswordSchema.safeParse(body)

      if (!result.success) {
        logger.warn('Forgot password parameter validation failed')
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const data = await authService.forgotPassword(result.data)
      return { success: true, data }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) {
        throw error
      }
      sentry.captureException(error)
      throw error
    }
  }

  async resetPassword(event: H3Event) {
    logger.info('Handling password reset execution')
    try {
      const body = await readBody(event)
      const result = resetPasswordSchema.safeParse(body)

      if (!result.success) {
        logger.warn('Reset password validation failed')
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const data = await authService.resetPassword(result.data)
      logger.info('Password reset completed successfully')
      return { success: true, data }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) {
        throw error
      }
      sentry.captureException(error)
      throw error
    }
  }
}

export const authController = new AuthController()
