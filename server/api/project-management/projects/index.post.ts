import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Create a new project',
    operationId: 'createProject',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 100 },
              description: { type: 'string', maxLength: 2000 },
              dueDate: { type: 'string', format: 'date-time' },
              colorCode: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Project created successfully',
      },
      422: {
        description: 'Validation failed',
      },
      401: {
        description: 'Authentication required',
      },
    },
  } as any,
})

export default defineEventHandler((event) => projectManagementController.createProject(event))
