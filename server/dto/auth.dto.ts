export interface RegisterRequestDto {
  firstName: string
  lastName: string
  age: number
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface LoginRequestDto {
  email: string
  password: string
}

export interface UserResponseDto {
  id: string
  firstName: string
  lastName: string
  age: number
  email: string
  phone: string
  profilePictureUrl: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthResponseDto {
  accessToken: string
  user: UserResponseDto
}

export interface ForgotPasswordRequestDto {
  email: string
}

export interface ResetPasswordRequestDto {
  token: string
  password: string
  confirmPassword: string
}

export interface EmailValidationRequestDto {
  token: string
}

export interface UpdateProfileRequestDto {
  firstName?: string
  lastName?: string
  age?: number
  email?: string
  phone?: string
}

