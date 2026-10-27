import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'List user notifications',
    operationId: 'listNotifications',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
      { name: 'isRead', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
    ],
    responses: {
      200: { description: 'Notifications retrieved successfully' },
      401: { description: 'Authentication required' },
      422: { description: 'Validation failed' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.listNotifications(event))
