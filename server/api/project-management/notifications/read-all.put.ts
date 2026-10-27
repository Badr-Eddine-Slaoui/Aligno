import { projectManagementController } from '../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Mark all user notifications as read',
    operationId: 'markAllNotificationsRead',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'All notifications marked as read successfully' },
      401: { description: 'Authentication required' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.markAllNotificationsRead(event))
