import { authController } from '../../controller/auth.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Get current user profile',
    description: 'Returns the authenticated user profile.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User profile returned' },
      401: { description: 'Authentication required' },
      404: { description: 'User not found' },
    },
  },
})

export default defineEventHandler((event) => authController.getMe(event))
