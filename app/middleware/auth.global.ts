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

  // While the session is being restored, abort navigation to prevent
  // page components/layouts from rendering. The plugin will initiate
  // the redirect once restoration completes.
  if (authStore.isSessionRestoring) {
    return abortNavigation()
  }



  const isGuestRoute = GUEST_ROUTES.some(r => to.path === r || to.path.startsWith(r + '?'))

  if (!authStore.isAuthenticated && !isGuestRoute) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    }, { replace: true })
  }

  if (authStore.isAuthenticated && isGuestRoute) {
    const redirect = (to.query.redirect as string) || '/dashboard'
    return navigateTo(redirect, { replace: true })
  }
})

