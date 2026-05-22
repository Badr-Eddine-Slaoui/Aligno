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
        },
      },
    },
    tags: ['Auth'],
    summary: 'Log out the current user',
    operationId: 'authLogout',
    description:
      'Invalidates the stored refresh token, clears the refresh cookie, and ends the session. If the access token is expired but the refresh cookie is valid, Nitro can still identify the user and emit X-Access-Token before logout completes.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Logged out successfully',
        headers: {
          'Set-Cookie': {
            description: 'Expires the refresh_token cookie immediately.',
            schema: { type: 'string', example: 'refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict' },
          },
          'X-Access-Token': {
            description: 'New access token returned if the request was refreshed before logout.',
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MessageSuccessResponse' },
            examples: {
              default: { value: { success: true, data: { message: 'Logged out successfully' } } },
            },
          },
        },
      },
      401: {
        description: 'Authentication required',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, examples: { default: { value: { success: false, message: 'Authentication required' } } } } },
      },
    },
  },
})

export default defineEventHandler((event) => authController.logout(event))
