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

  // While the session is being restored, allow navigation through.
  // The full-screen loading overlay in app.vue covers all content,
  // and the plugin will redirect to the correct page once restore completes.
  if (authStore.isSessionRestoring) return


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
