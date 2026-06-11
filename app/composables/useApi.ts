import { useAuthStore } from '~/stores/auth'
import type { ApiError, ApiResponse } from '~/types'

export const useApi = () => {
  const runtimeConfig = useRuntimeConfig()
  const authStore = useAuthStore()

  // Base $fetch options
  const apiFetch = $fetch.create({
    baseURL: runtimeConfig.public.apiBase,
    async onRequest({ options }) {
      // Add Bearer JWT if present in-memory
      if (authStore.accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authStore.accessToken}`,
        } as any
      }
    },
    async onResponse({ response }) {
      // Look for access token rotation header from middleware
      const rotatedToken = response.headers.get('X-Access-Token')
      if (rotatedToken) {
        authStore.setToken(rotatedToken)
      }
    },
    async onResponseError({ response, options }) {
      // Handle automatic token refresh if we get a 401 Unauthorized
      if (response.status === 401 && authStore.accessToken) {
        try {
          // Attempt a request to /me to trigger silent cookie refresh
          const refreshRes = await $fetch<ApiResponse<{ accessToken: string }>>('/api/auth/me', {
            baseURL: runtimeConfig.public.apiBase,
          })
          
          if (refreshRes.success && refreshRes.data.accessToken) {
            authStore.setToken(refreshRes.data.accessToken)
            
            // Retry the original request
            if (options.headers) {
              (options.headers as any).Authorization = `Bearer ${refreshRes.data.accessToken}`
            }
            return $fetch(response.url as any, options as any)
          }
        } catch (refreshErr) {
          // Refresh failed, clear session
          authStore.logout()
        }
      }
      
      const errorPayload: ApiError = {
        statusCode: response.status,
        statusMessage: response.statusText || 'API Error',
        data: response._data,
      }
      throw errorPayload
    }
  })

  return apiFetch
}
