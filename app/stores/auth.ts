import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const isLoading = ref(false)
  const isSessionRestoring = ref(true)

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)

  function setUser(u: User | null) {
    user.value = u
  }

  function setToken(token: string | null) {
    accessToken.value = token
  }

  function logout() {
    user.value = null
    accessToken.value = null
    // Clean up refresh_token cookie manually if required, or rely on API response to set-cookie Max-Age=0
    navigateTo('/login')
  }

  return {
    user,
    accessToken,
    isLoading,
    isSessionRestoring,
    isAuthenticated,
    setUser,
    setToken,
    logout,
  }
})
