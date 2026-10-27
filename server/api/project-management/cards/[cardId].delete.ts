import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Delete card',
    operationId: 'deleteCard',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'cardId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Card deleted successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Card not found' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.deleteCard(event))
