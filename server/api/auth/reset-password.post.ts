import { authController } from '../../controller/auth.controller'

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
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
              confirmPassword: { type: 'string', description: 'Confirm the password.', example: 'NewP@ssw0rd!' },
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
    summary: 'Reset password with a token',
    operationId: 'authResetPassword',
    description:
      'Resets the password using a valid reset token, validates the 1-hour reset window, hashes the new password, and clears the reset state.',
    security: [],
    requestBody: {
      required: true,
      description: 'Reset token and new password payload.',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ResetPasswordRequest',
          },
          examples: {
            default: {
              summary: 'Reset password payload',
              value: {
                token: 'a1b2c3d4e5f6',
                password: 'NewP@ssw0rd!',
                confirmPassword: 'NewP@ssw0rd!',
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Password reset successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MessageSuccessResponse' },
            examples: {
              default: { value: { success: true, data: { message: 'Password reset successfully' } } },
            },
          },
        },
      },
      400: {
        description: 'Invalid or expired reset token',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, examples: { default: { value: { success: false, message: 'Invalid or expired reset token' } } } } },
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
                  errors: {
                    password: ['Password must contain at least one special character'],
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

export default defineEventHandler((event) => authController.resetPassword(event))
