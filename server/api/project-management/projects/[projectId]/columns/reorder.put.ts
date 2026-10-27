import { projectManagementController } from '../../../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Reorder columns in project',
    operationId: 'reorderColumns',
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
            required: ['columnIds'],
            properties: {
              columnIds: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Columns reordered successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Project not found' },
      422: { description: 'Validation failed' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.reorderColumns(event))
