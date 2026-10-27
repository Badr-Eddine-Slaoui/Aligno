import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'List user projects',
    operationId: 'listProjects',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
      { name: 'isArchived', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
    ],
    responses: {
      200: {
        description: 'List of projects retrieved successfully',
      },
      401: {
        description: 'Authentication required',
      },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.listProjects(event))
