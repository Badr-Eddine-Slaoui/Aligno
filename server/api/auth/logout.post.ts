import { authController } from '../../controller/auth.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Log out',
    description: 'Invalidates the user refresh token and clears the refresh cookie.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Logged out successfully' },
      401: { description: 'Authentication required' },
    },
  },
})

export default defineEventHandler((event) => authController.logout(event))
