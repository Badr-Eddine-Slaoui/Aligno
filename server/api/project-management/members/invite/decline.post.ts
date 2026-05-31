import { projectManagementController } from '../../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Decline invitation to project',
    operationId: 'declineInvite',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['token'],
            properties: {
              token: { type: 'string', minLength: 1 },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Invitation declined successfully' },
      400: { description: 'Invalid token or expired invitation' },
      401: { description: 'Authentication required' },
    },
  } as any,
})

export default defineEventHandler((event) => projectManagementController.declineInvite(event))
