import { useAuthStore } from '~/stores/auth'
import { useApiService } from '~/services/api'

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  const apiService = useApiService()

  // Only run on client side
  if (process.client) {
    authStore.isLoading = true
    try {
      // Fetch /me to trigger silent token refresh using the HttpOnly cookie
      const res = await apiService.auth.me()
      if (res.success && res.data?.user) {
        authStore.setUser(res.data.user)
      }
    } catch {
      // Silent catch, user remains unauthenticated
    } finally {
      authStore.isLoading = false
    }
  }
})
