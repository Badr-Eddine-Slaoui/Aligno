import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Update subtask details',
    operationId: 'updateSubtask',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'subtaskId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string', minLength: 2, maxLength: 200 },
              isCompleted: { type: 'boolean' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Subtask updated successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Subtask not found' },
      422: { description: 'Validation failed' },
    },
  } as any,
})

export default defineEventHandler((event) => projectManagementController.updateSubtask(event))
