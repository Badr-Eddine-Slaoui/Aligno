import type { 
  ApiResponse, 
  LoginResponse, 
  RegisterResponse, 
  User 
} from '~/types'

export const useApiService = () => {
  const apiFetch = useApi()

  return {
    auth: {
      async login(payload: Record<string, any>): Promise<ApiResponse<LoginResponse>> {
        return apiFetch('/auth/login', {
          method: 'POST',
          body: payload,
        })
      },

      async register(payload: Record<string, any> | FormData): Promise<ApiResponse<RegisterResponse>> {
        return apiFetch('/auth/register', {
          method: 'POST',
          body: payload,
        })
      },

      async logout(): Promise<ApiResponse<{ message: string }>> {
        return apiFetch('/auth/logout', {
          method: 'POST',
        })
      },

      async me(): Promise<ApiResponse<User>> {
        return apiFetch('/auth/me', {
          method: 'GET',
        })
      },

      async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch('/auth/forgot-password', {
          method: 'POST',
          body: { email },
        })
      },

      async resetPassword(payload: Record<string, any>): Promise<ApiResponse<{ message: string }>> {
        return apiFetch('/auth/reset-password', {
          method: 'POST',
          body: payload,
        })
      },

      async verifyEmail(payload: Record<string, any>): Promise<ApiResponse<{ message: string }>> {
        return apiFetch('/auth/email/validation', {
          method: 'POST',
          body: payload,
        })
      },

      async updateProfile(payload: Record<string, any> | FormData): Promise<ApiResponse<{ user: User }>> {
        return apiFetch('/auth/profile', {
          method: 'PUT',
          body: payload,
        })
      }
    }
  }
}
