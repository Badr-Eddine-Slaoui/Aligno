import { authController } from '../../controller/auth.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Reset password',
    description: 'Resets the user password using a valid reset token.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['token', 'password', 'confirmPassword'],
            properties: {
              token: { type: 'string', example: 'a1b2c3d4e5f6' },
              password: { type: 'string', example: 'NewP@ssw0rd!' },
              confirmPassword: { type: 'string', example: 'NewP@ssw0rd!' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Password reset successfully' },
      400: { description: 'Invalid or expired reset token' },
      422: { description: 'Validation errors' },
    },
  },
})

export default defineEventHandler((event) => authController.resetPassword(event))
