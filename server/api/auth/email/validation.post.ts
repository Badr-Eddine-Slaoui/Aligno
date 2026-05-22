import { authController } from '../../../controller/auth.controller'

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          EmailValidationRequest: {
            type: 'object',
            required: ['token'],
            properties: {
              token: { type: 'string', example: 'a1b2c3d4e5f6' },
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
          ErrorResponse: {
            type: 'object',
            required: ['success', 'message'],
            properties: {
              success: { type: 'boolean', const: false },
              message: { type: 'string' },
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
        },
      },
    },
    tags: ['Auth'],
    summary: 'Verify email address',
    operationId: 'authVerifyEmail',
    description:
      'Validates the email verification token, checks its expiry, marks the account as verified, and clears the stored token.',
    security: [],
    requestBody: {
      required: true,
      description: 'Email verification token sent by email.',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/EmailValidationRequest',
          },
          examples: {
            default: {
              summary: 'Verification payload',
              value: { token: 'a1b2c3d4e5f6' },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Email verified successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MessageSuccessResponse' },
            examples: {
              default: { value: { success: true, data: { message: 'Email verified successfully' } } },
            },
          },
        },
      },
      400: {
        description: 'Invalid or expired verification token',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, examples: { default: { value: { success: false, message: 'Invalid or expired verification token' } } } } },
      },
      403: {
        description: 'Guests only',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, examples: { default: { value: { success: false, message: 'Guests only' } } } } },
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
                  errors: { token: ['Verification token is required'] },
                },
              },
            },
          },
        },
      },
    },
  },
})

export default defineEventHandler((event) => authController.emailValidation(event))
