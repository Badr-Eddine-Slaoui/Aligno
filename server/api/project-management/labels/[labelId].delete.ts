import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Delete label',
    operationId: 'deleteLabel',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'labelId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Label deleted successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Label not found' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.deleteLabel(event))
