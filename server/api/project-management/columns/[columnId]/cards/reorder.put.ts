import { projectManagementController } from '../../../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Reorder cards in column',
    operationId: 'reorderCards',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'columnId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['cardIds'],
            properties: {
              cardIds: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Cards reordered successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Column not found' },
      422: { description: 'Validation failed' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.reorderCards(event))
