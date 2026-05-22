import type { User } from '@prisma/client'

export interface CreateUserData {
  firstName: string
  lastName: string
  age: number
  email: string
  phone: string
  passwordHash: string
  profilePictureUrl?: string
  emailVerifyToken?: string
  emailVerifyExpires?: Date
}

export interface IUserDAO {
  create(data: CreateUserData): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByPhone(phone: string): Promise<User | null>
  findByEmailVerifyToken(token: string): Promise<User | null>
  findByResetPasswordToken(token: string): Promise<User | null>
  updateRefreshToken(id: string, refreshToken: string | null): Promise<User>
  updateEmailVerified(id: string): Promise<User>
  updateEmailVerifyToken(id: string, token: string | null, expires: Date | null): Promise<User>
  updateResetPasswordToken(id: string, token: string | null, expires: Date | null): Promise<User>
  updatePassword(id: string, passwordHash: string): Promise<User>
}
