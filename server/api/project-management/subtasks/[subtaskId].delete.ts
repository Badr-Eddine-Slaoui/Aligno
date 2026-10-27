import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Delete subtask',
    operationId: 'deleteSubtask',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'subtaskId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Subtask deleted successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Subtask not found' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.deleteSubtask(event))
