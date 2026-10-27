import { authController } from '../../controller/auth.controller'

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          ForgotPasswordRequest: {
            type: 'object',
            required: ['email'],
            properties: {
              email: { type: 'string', format: 'email', example: 'john@example.com' },
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
    summary: 'Request a password reset',
    operationId: 'authForgotPassword',
    description:
      'Requests a password reset. The route validates the email, never reveals whether the account exists, and sends a reset email only when a matching user is found. This route is guest-only.',
    security: [],
    requestBody: {
      required: true,
      description: 'Email address used to initiate the password reset flow.',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ForgotPasswordRequest',
          },
          examples: {
            default: {
              summary: 'Forgot password payload',
              value: { email: 'john@example.com' },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'If the account exists, a reset email has been sent',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MessageSuccessResponse' },
            examples: {
              default: {
                value: {
                  success: true,
                  data: { message: 'If an account with that email exists, a password reset link has been sent' },
                },
              },
            },
          },
        },
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
                  errors: { email: ['Invalid email address'] },
                },
              },
            },
          },
        },
      },
    },
  },
})

export default defineEventHandler((event) => authController.forgotPassword(event))
