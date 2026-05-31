import { projectManagementController } from '../../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Assign labels to card',
    operationId: 'assignCardLabels',
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
            required: ['labelIds'],
            properties: {
              labelIds: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Labels assigned successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Card not found' },
      422: { description: 'Validation failed' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.assignCardLabels(event))
