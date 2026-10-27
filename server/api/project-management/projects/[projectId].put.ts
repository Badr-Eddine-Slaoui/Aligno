import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Update project details',
    operationId: 'updateProject',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 100 },
              description: { type: 'string', maxLength: 2000 },
              dueDate: { type: 'string', format: 'date-time', nullable: true },
              colorCode: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Project updated successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Project not found' },
      422: { description: 'Validation failed' },
    },
  } as any,
})

export default defineEventHandler((event) => projectManagementController.updateProject(event))
