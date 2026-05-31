import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Update card details',
    operationId: 'updateCard',
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
            properties: {
              title: { type: 'string', minLength: 2, maxLength: 200 },
              description: { type: 'string', maxLength: 5000, nullable: true },
              dueDate: { type: 'string', format: 'date-time', nullable: true },
              priority: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
              assigneeId: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Card updated successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Card not found' },
      422: { description: 'Validation failed' },
    },
  } as any,
})

export default defineEventHandler((event) => projectManagementController.updateCard(event))
