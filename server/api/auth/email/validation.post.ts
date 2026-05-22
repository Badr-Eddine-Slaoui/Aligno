import { authController } from '../../../controller/auth.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Verify email address',
    description: 'Validates the email verification token.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['token'],
            properties: {
              token: { type: 'string', example: 'a1b2c3d4e5f6' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Email verified successfully' },
      400: { description: 'Invalid or expired verification token' },
      422: { description: 'Validation errors' },
    },
  },
})

export default defineEventHandler((event) => authController.emailValidation(event))
