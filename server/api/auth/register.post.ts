import { authController } from '../../controller/auth.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Register a new user',
    description: 'Creates a new user account.',
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: ['firstName', 'lastName', 'age', 'email', 'phone', 'password', 'confirmPassword'],
            properties: {
              firstName: { type: 'string', example: 'John' },
              lastName: { type: 'string', example: 'Doe' },
              age: { type: 'integer', example: 25 },
              email: { type: 'string', format: 'email', example: 'john@example.com' },
              phone: { type: 'string', example: '+212612345678' },
              password: { type: 'string', example: 'P@ssw0rd!' },
              confirmPassword: { type: 'string', example: 'P@ssw0rd!' },
              profilePicture: { type: 'string', format: 'binary' },
            },
          },
        },
      },
    },
    responses: {
      201: { description: 'User registered successfully' },
      409: { description: 'Email or phone already in use' },
      422: { description: 'Validation errors' },
    },
  },
})

export default defineEventHandler((event) => authController.register(event))
