import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Get card details',
    operationId: 'getCardDetail',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'cardId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Card details retrieved successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Card not found' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.getCardDetail(event))
