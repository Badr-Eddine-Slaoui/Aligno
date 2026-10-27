import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Update member role',
    operationId: 'updateMemberRole',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'memberId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['role'],
            properties: {
              role: { type: 'string', enum: ['ADMIN', 'MEMBER', 'VISITOR'] },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Member role updated successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Member not found' },
      422: { description: 'Validation failed' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.updateMemberRole(event))
