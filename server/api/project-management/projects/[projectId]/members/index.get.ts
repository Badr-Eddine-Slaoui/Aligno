import { projectManagementController } from '../../../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'List project members',
    operationId: 'listMembers',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Project members retrieved successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Project not found' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.listMembers(event))
