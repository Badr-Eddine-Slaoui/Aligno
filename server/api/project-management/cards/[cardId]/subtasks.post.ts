import { projectManagementController } from '../../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Create subtask in card',
    operationId: 'createSubtask',
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
            required: ['title'],
            properties: {
              title: { type: 'string', minLength: 2, maxLength: 200 },
            },
          },
        },
      },
    },
    responses: {
      201: { description: 'Subtask created successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Card not found' },
      422: { description: 'Validation failed' },
    },
  } as any,
})

export default defineEventHandler((event) => projectManagementController.createSubtask(event))
