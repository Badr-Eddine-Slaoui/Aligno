import { authController } from '../../controller/auth.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Request a password reset',
    description: 'Sends a password reset email if the account exists.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email'],
            properties: {
              email: { type: 'string', format: 'email', example: 'john@example.com' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'If the account exists, a reset email has been sent' },
      422: { description: 'Validation errors' },
    },
  },
})

export default defineEventHandler((event) => authController.forgotPassword(event))
