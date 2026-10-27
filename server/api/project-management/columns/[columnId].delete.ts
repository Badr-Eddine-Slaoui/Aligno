import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Delete column',
    operationId: 'deleteColumn',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'columnId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Column deleted successfully' },
      400: { description: 'Cannot delete non-empty column' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Column not found' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.deleteColumn(event))
