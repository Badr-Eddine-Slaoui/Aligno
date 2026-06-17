import { useAuthStore } from '~/stores/auth'

const GUEST_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const runtimeConfig = useRuntimeConfig()

  // Only run on client side
  if (!process.client) return

  authStore.isSessionRestoring = true
  try {
    // Use $fetch.raw so we can read response headers directly (X-Access-Token)
    const res = await $fetch.raw('/auth/me', {
      baseURL: runtimeConfig.public.apiBase,
      method: 'GET',
      credentials: 'include',
    })

    // Extract the silently-refreshed access token from the response header
    const newToken = res.headers.get('X-Access-Token')
    const body = res._data as any

    if (body?.success && body?.data) {
      authStore.setUser(body.data)
      // Always set token — use the header value if present, otherwise keep existing
      if (newToken) {
        authStore.setToken(newToken)
      }
    }
  } catch {
    // Silent catch — user remains unauthenticated (401 = no valid cookie)
  } finally {
    authStore.isSessionRestoring = false

    const route = useRoute()
    const isGuestRoute = GUEST_ROUTES.includes(route.path)

    if (!authStore.isAuthenticated && !isGuestRoute) {
      navigateTo({
        path: '/login',
        query: { redirect: route.fullPath },
      })
    } else if (authStore.isAuthenticated && isGuestRoute) {
      navigateTo('/dashboard')
    }
  }
})
