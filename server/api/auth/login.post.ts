import { authController } from '../../controller/auth.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Log in',
    description: 'Authenticates a user with email and password.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email', example: 'john@example.com' },
              password: { type: 'string', example: 'P@ssw0rd!' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Login successful' },
      401: { description: 'Invalid email or password' },
      403: { description: 'Email not yet verified' },
      422: { description: 'Validation errors' },
    },
  },
})

export default defineEventHandler((event) => authController.login(event))
