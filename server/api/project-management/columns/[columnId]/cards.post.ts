import { projectManagementController } from '../../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Create card in column',
    operationId: 'createCard',
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
            required: ['title'],
            properties: {
              title: { type: 'string', minLength: 2, maxLength: 200 },
              description: { type: 'string', maxLength: 5000 },
              dueDate: { type: 'string', format: 'date-time' },
              priority: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
              assigneeId: { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      201: { description: 'Card created successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Column not found' },
      422: { description: 'Validation failed' },
    },
  } as any,
})

export default defineEventHandler((event) => projectManagementController.createCard(event))
