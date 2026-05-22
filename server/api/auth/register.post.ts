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
              firstName: { type: 'string', description: '2 to 50 characters.', maxLength: 50 },
              lastName: { type: 'string', description: '2 to 50 characters.', maxLength: 50 },
              age: { type: 'integer', minimum: 13, maximum: 120 },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string', example: '+212612345678' },
              profilePictureUrl: { type: ['string', 'null'], description: 'Profile image URL or null when unset.' },
              emailVerified: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          AuthSuccessResponse: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean', const: true },
              data: {
                type: 'object',
                required: ['accessToken', 'user'],
                properties: {
                  accessToken: { type: 'string', description: 'JWT access token valid for 15 minutes.' },
                  user: { $ref: '#/components/schemas/UserResponse' },
                },
              },
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
          RegisterRequest: {
            type: 'object',
            required: ['firstName', 'lastName', 'age', 'email', 'phone', 'password', 'confirmPassword'],
            properties: {
              firstName: { type: 'string', description: '2 to 50 characters.', maxLength: 50, example: 'John' },
              lastName: { type: 'string', description: '2 to 50 characters.', maxLength: 50, example: 'Doe' },
              age: { type: 'integer', minimum: 13, maximum: 120, example: 25 },
              email: { type: 'string', format: 'email', example: 'john@example.com' },
              phone: { type: 'string', example: '+212612345678', description: 'E.164 phone number.' },
              password: {
                type: 'string',
                description: 'At least 8 characters including uppercase, lowercase, number, and special character.',
                example: 'P@ssw0rd!',
              },
              confirmPassword: { type: 'string', description: 'Confirm the password.', example: 'P@ssw0rd!' },
              profilePicture: { type: 'string', format: 'binary', description: 'Optional avatar upload.' },
            },
          },
        },
      },
    },
    tags: ['Auth'],
    summary: 'Register a new user account',
    operationId: 'authRegister',
    description:
      'Creates a new account with multipart form-data, validates the password policy, validates E.164 phone numbers, optionally uploads a profile picture, sends a verification email, and returns the new access token and sanitized user profile.',
    security: [],
    requestBody: {
      required: true,
      description: 'Multipart form-data payload for creating a user account.',
      content: {
        'multipart/form-data': {
          schema: {
            $ref: '#/components/schemas/RegisterRequest',
          },
          encoding: {
            profilePicture: { contentType: 'image/*' },
          },
          examples: {
            default: {
              summary: 'Register payload',
              value: {
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'john@example.com',
                phone: '+212612345678',
                password: 'P@ssw0rd!',
                confirmPassword: 'P@ssw0rd!',
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AuthSuccessResponse' },
            examples: {
              default: {
                summary: 'New user response',
                value: {
                  success: true,
                  data: {
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                      id: '550e8400-e29b-41d4-a716-446655440000',
                      firstName: 'John',
                      lastName: 'Doe',
                      age: 25,
                      email: 'john@example.com',
                      phone: '+212612345678',
                      profilePictureUrl: 'https://cdn.example.com/uploads/users/john.webp',
                      emailVerified: false,
                      createdAt: '2026-05-22T12:00:00.000Z',
                      updatedAt: '2026-05-22T12:00:00.000Z',
                    },
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
      403: {
        description: 'Guests only',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            examples: {
              default: { value: { success: false, message: 'Guests only' } },
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
                    password: ['Password must contain at least one special character'],
                  },
                },
              },
            },
          },
          MessageSuccessResponse: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean', const: true },
              data: {
                type: 'object',
                required: ['message'],
                properties: { message: { type: 'string' } },
              },
            },
          },
          ForgotPasswordRequest: {
            type: 'object',
            required: ['email'],
            properties: {
              email: { type: 'string', format: 'email', example: 'john@example.com' },
            },
          },
          EmailValidationRequest: {
            type: 'object',
            required: ['token'],
            properties: {
              token: { type: 'string', example: 'a1b2c3d4e5f6' },
            },
          },
          ResetPasswordRequest: {
            type: 'object',
            required: ['token', 'password', 'confirmPassword'],
            properties: {
              token: { type: 'string', example: 'a1b2c3d4e5f6' },
              password: {
                type: 'string',
                description: 'At least 8 characters including uppercase, lowercase, number, and special character.',
                example: 'NewP@ssw0rd!',
              },
              confirmPassword: { type: 'string', example: 'NewP@ssw0rd!' },
            },
          },
        },
      },
    },
  },
})

export default defineEventHandler((event) => authController.register(event))
