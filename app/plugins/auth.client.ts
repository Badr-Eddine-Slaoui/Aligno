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

  if (!process.client) return

  authStore.isSessionRestoring = true
  try {
    const res = await $fetch.raw('/auth/me', {
      baseURL: runtimeConfig.public.apiBase,
      method: 'GET',
      credentials: 'include',
    })

    const newToken = res.headers.get('X-Access-Token')
    const body = res._data as any

    if (body?.success && body?.data) {
      authStore.setUser(body.data)
      if (newToken) {
        authStore.setToken(newToken)
      }
    }
  } catch {
    // Silent catch — user remains unauthenticated (401 = no valid cookie)
  } finally {
    const route = useRoute()
    const isGuestRoute = GUEST_ROUTES.some(r => route.path === r || route.path.startsWith(r + '?'))

    if (!authStore.isAuthenticated && !isGuestRoute) {
      // Redirect to login while overlay is still visible (isSessionRestoring still true)
      await navigateTo({
        path: '/login',
        query: { redirect: route.fullPath },
        replace: true,
      })
    } else if (authStore.isAuthenticated && isGuestRoute) {
      // Redirect to dashboard (or intended page) while overlay is still visible
      const redirect = (route.query.redirect as string) || '/dashboard'
      await navigateTo(redirect, { replace: true })
    }

    // Only hide the overlay AFTER navigation has completed.
    // This prevents any flash of the wrong page between restore and redirect.
    authStore.isSessionRestoring = false
  }
})
