import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Remove member or leave project',
    operationId: 'removeMember',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'memberId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Member removed successfully or left project' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Member not found' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.removeMember(event))
