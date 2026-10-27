import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Update label details',
    operationId: 'updateLabel',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'labelId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 30 },
              color: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Label updated successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Label not found' },
      422: { description: 'Validation failed' },
    },
  } as any,
})

export default defineEventHandler((event) => projectManagementController.updateLabel(event))
