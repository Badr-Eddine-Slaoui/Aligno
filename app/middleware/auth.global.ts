import { useAuthStore } from '~/stores/auth'

const GUEST_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return

  const authStore = useAuthStore()

  // While the session is being restored, block navigation entirely.
  // The plugin that restores the session will call router.push() once done.
  if (authStore.isSessionRestoring) {
    return abortNavigation()
  }

  const isGuestRoute = GUEST_ROUTES.some(r => to.path === r || to.path.startsWith(r + '?'))

  if (!authStore.isAuthenticated && !isGuestRoute) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
      replace: true,
    })
  }

  if (authStore.isAuthenticated && isGuestRoute) {
    const redirect = (to.query.redirect as string) || '/dashboard'
    return navigateTo(redirect, { replace: true })
  }
})
