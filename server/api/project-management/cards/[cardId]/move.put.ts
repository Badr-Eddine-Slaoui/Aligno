import { projectManagementController } from '../../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Move card',
    operationId: 'moveCard',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'cardId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['targetColumnId', 'position'],
            properties: {
              targetColumnId: { type: 'string' },
              position: { type: 'integer', minimum: 0 },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Card moved successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Card or column not found' },
      422: { description: 'Validation failed' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.moveCard(event))
