import { projectManagementController } from '../../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Mark single notification as read',
    operationId: 'markNotificationRead',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'notificationId', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Notification marked as read successfully' },
      401: { description: 'Authentication required' },
      404: { description: 'Notification not found' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.markNotificationRead(event))
