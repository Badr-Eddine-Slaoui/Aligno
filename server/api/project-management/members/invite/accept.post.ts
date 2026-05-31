import { projectManagementController } from '../../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Accept invitation to project',
    operationId: 'acceptInvite',
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
      200: { description: 'Invitation accepted successfully' },
      400: { description: 'Invalid token or expired invitation' },
      401: { description: 'Authentication required' },
    },
  } as any,
})

export default defineEventHandler((event) => projectManagementController.acceptInvite(event))
