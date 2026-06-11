export interface User {
  id: string
  firstName: string
  lastName: string
  age: number
  email: string
  phone: string
  profilePictureUrl: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiError {
  statusCode: number
  statusMessage: string
  data?: { errors?: Record<string, string[]> }
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RegisterResponse {
  message: string
  user: User
}
