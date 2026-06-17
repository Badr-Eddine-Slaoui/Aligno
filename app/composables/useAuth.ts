import { useAuthStore } from '~/stores/auth'
import { useApiService } from '~/services/api'

export const useAuth = () => {
  const authStore = useAuthStore()
  const apiService = useApiService()
  const router = useRouter()
  const route = useRoute()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)

  async function login(payload: Record<string, any>) {
    authStore.isLoading = true
    try {
      const res = await apiService.auth.login(payload)
      if (res.success && res.data) {
        authStore.setUser(res.data.user)
        authStore.setToken(res.data.accessToken)
        
        const redirectPath = (route.query.redirect as string) || '/dashboard'
        await router.push(redirectPath)
      }
      return res
    } finally {
      authStore.isLoading = false
    }
  }

  async function register(payload: Record<string, any>) {
    authStore.isLoading = true
    try {
      return await apiService.auth.register(payload)
    } finally {
      authStore.isLoading = false
    }
  }

  async function logout() {
    authStore.isLoading = true
    try {
      await apiService.auth.logout()
    } catch {
      // Allow local logout anyway if server route fails
    } finally {
      authStore.logout()
      authStore.isLoading = false
    }
  }

  async function fetchUser() {
    authStore.isLoading = true
    try {
      const res = await apiService.auth.me()
      if (res.success && res.data) {
        authStore.setUser(res.data as any)
      }
      return res
    } catch (err) {
      authStore.logout()
      throw err
    } finally {
      authStore.isLoading = false
    }
  }

  async function updateProfile(payload: Record<string, any> | FormData) {
    authStore.isLoading = true
    try {
      const res = await apiService.auth.updateProfile(payload)
      if (res.success && res.data?.user) {
        // The endpoint returns the updated user inside the response envelope
        authStore.setUser(res.data.user)
      }
      return res
    } finally {
      authStore.isLoading = false
    }
  }

  async function forgotPassword(email: string) {
    authStore.isLoading = true
    try {
      return await apiService.auth.forgotPassword(email)
    } finally {
      authStore.isLoading = false
    }
  }

  async function resetPassword(payload: Record<string, any>) {
    authStore.isLoading = true
    try {
      return await apiService.auth.resetPassword(payload)
    } finally {
      authStore.isLoading = false
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    forgotPassword,
    resetPassword,
  }
}
