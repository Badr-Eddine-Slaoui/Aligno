import { useAuthStore } from '~/stores/auth'

const GUEST_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Skip middleware during server build or prerendering to prevent execution delays
  if (process.server) return

  // Wait for session restoration to complete before enforcing route protection
  if (authStore.isSessionRestoring) return

  const isGuestRoute = GUEST_ROUTES.includes(to.path)

  if (!authStore.isAuthenticated && !isGuestRoute) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  if (authStore.isAuthenticated && isGuestRoute) {
    return navigateTo('/dashboard')
  }
})
