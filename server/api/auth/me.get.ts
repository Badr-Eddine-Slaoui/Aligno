import { authController } from '../../controller/auth.controller'

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            description: 'Bearer JWT used for authenticated endpoints.',
          },
        },
        schemas: {
          UserResponse: {
            type: 'object',
            required: ['id', 'firstName', 'lastName', 'age', 'email', 'phone', 'profilePictureUrl', 'emailVerified', 'createdAt', 'updatedAt'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              firstName: { type: 'string', description: '2 to 50 characters.' },
              lastName: { type: 'string', description: '2 to 50 characters.' },
              age: { type: 'integer', minimum: 13, maximum: 120 },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string', example: '+212612345678' },
              profilePictureUrl: { type: ['string', 'null'], description: 'Profile image URL or null when unset.' },
              emailVerified: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          UserSuccessResponse: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean', const: true },
              data: { $ref: '#/components/schemas/UserResponse' },
            },
          },
          ErrorResponse: {
            type: 'object',
            required: ['success', 'message'],
            properties: {
              success: { type: 'boolean', const: false },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    tags: ['Auth'],
    summary: 'Get the current user profile',
    operationId: 'authGetMe',
    description:
      'Returns the authenticated user profile. The route accepts a Bearer JWT access token and can also be satisfied through a valid refresh cookie via silent refresh, which adds X-Access-Token to the response headers.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'User profile returned',
        headers: {
          'X-Access-Token': {
            description: 'New access token returned when the request was refreshed from a valid refresh cookie.',
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserSuccessResponse' },
            examples: {
              default: {
                value: {
                  success: true,
                  data: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: 'john@example.com',
                    phone: '+212612345678',
                    profilePictureUrl: 'https://cdn.example.com/uploads/users/john.webp',
                    emailVerified: true,
                    createdAt: '2026-05-22T12:00:00.000Z',
                    updatedAt: '2026-05-22T12:00:00.000Z',
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Authentication required',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, examples: { default: { value: { success: false, message: 'Authentication required' } } } } },
      },
      404: {
        description: 'User not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, examples: { default: { value: { success: false, message: 'User not found' } } } } },
      },
    },
  },
})

export default defineEventHandler((event) => authController.getMe(event))
