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
              errors: {
                type: 'object',
                additionalProperties: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          ValidationErrorResponse: {
            type: 'object',
            required: ['success', 'message', 'errors'],
            properties: {
              success: { type: 'boolean', const: false },
              message: { type: 'string' },
              errors: {
                type: 'object',
                additionalProperties: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          UpdateProfileRequest: {
            type: 'object',
            properties: {
              firstName: { type: 'string', description: '2 to 50 characters.', example: 'John' },
              lastName: { type: 'string', description: '2 to 50 characters.', example: 'Doe' },
              age: { type: 'integer', minimum: 13, maximum: 120, example: 25 },
              email: { type: 'string', format: 'email', example: 'john@example.com' },
              phone: { type: 'string', example: '+212612345678', description: 'E.164 phone number.' },
              profilePicture: { type: 'string', format: 'binary', description: 'Optional avatar upload.' },
            },
          },
        },
      },
    },
    tags: ['Auth'],
    summary: 'Update the user profile details',
    operationId: 'authUpdateProfile',
    description:
      'Updates the authenticated user profile with optional multipart form-data fields (firstName, lastName, age, email, phone). Replaces and optimizes the profile picture if provided, deleting the old one. Validates the E.164 phone number format and email uniqueness.',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      description: 'Multipart form-data payload for updating profile details.',
      content: {
        'multipart/form-data': {
          schema: {
            $ref: '#/components/schemas/UpdateProfileRequest',
          },
          encoding: {
            profilePicture: { contentType: 'image/*' },
          },
          examples: {
            default: {
              summary: 'Update profile details',
              value: {
                firstName: 'JohnNew',
                lastName: 'DoeNew',
                age: 26,
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Profile updated successfully',
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
                    firstName: 'JohnNew',
                    lastName: 'DoeNew',
                    age: 26,
                    email: 'john@example.com',
                    phone: '+212612345678',
                    profilePictureUrl: '/uploads/avatars/new-avatar.webp',
                    emailVerified: true,
                    createdAt: '2026-05-22T12:00:00.000Z',
                    updatedAt: '2026-05-23T12:00:00.000Z',
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: 'Request body is required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            examples: {
              default: { value: { success: false, message: 'Request body is required' } },
            },
          },
        },
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            examples: {
              default: { value: { success: false, message: 'Authentication required' } },
            },
          },
        },
      },
      409: {
        description: 'Email or phone already in use',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            examples: {
              default: { value: { success: false, message: 'Email already in use' } },
            },
          },
        },
      },
      422: {
        description: 'Validation errors',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
            examples: {
              default: {
                value: {
                  success: false,
                  message: 'Validation failed',
                  errors: {
                    email: ['Invalid email address'],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
})

export default defineEventHandler((event) => authController.updateProfile(event))
