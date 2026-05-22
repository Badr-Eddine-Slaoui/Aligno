import type { User } from '@prisma/client'
import type { IUserDAO, CreateUserData } from '../dao/user.dao'
import { prisma } from '../utils/prisma'

export class UserRepository implements IUserDAO {
  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data })
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } })
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { phone } })
  }

  async findByEmailVerifyToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { emailVerifyToken: token } })
  }

  async findByResetPasswordToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { resetPasswordToken: token } })
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { refreshToken },
    })
  }

  async updateEmailVerified(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    })
  }

  async updateEmailVerifyToken(
    id: string,
    token: string | null,
    expires: Date | null,
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { emailVerifyToken: token, emailVerifyExpires: expires },
    })
  }

  async updateResetPasswordToken(
    id: string,
    token: string | null,
    expires: Date | null,
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { resetPasswordToken: token, resetPasswordExpires: expires },
    })
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    })
  }
}

export const userRepository = new UserRepository()
