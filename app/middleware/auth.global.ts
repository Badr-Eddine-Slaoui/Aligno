import { useAuthStore } from '~/stores/auth'

const GUEST_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Skip middleware during server build or prerendering to prevent execution delays
  if (process.server) return

  const isGuestRoute = GUEST_ROUTES.includes(to.path)

  if (!authStore.isAuthenticated && !isGuestRoute) {
    return navigateTo('/login')
  }

  if (authStore.isAuthenticated && isGuestRoute) {
    return navigateTo('/dashboard')
  }
})
