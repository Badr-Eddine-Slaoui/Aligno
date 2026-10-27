import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Update column',
    operationId: 'updateColumn',
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
            required: ['name'],
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 50 },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Column updated successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Column not found' },
      422: { description: 'Validation failed' },
    },
  } as any,
})

export default defineEventHandler((event) => projectManagementController.updateColumn(event))
