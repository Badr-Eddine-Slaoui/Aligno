import { projectManagementController } from '../../../../../controller/project-management.controller'

defineRouteMeta({
  openAPI: {
    tags: ['Project Management'],
    summary: 'Invite member to project',
    operationId: 'inviteMember',
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
            required: ['email', 'role'],
            properties: {
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['MEMBER', 'VISITOR'] },
            },
          },
        },
      },
    },
    responses: {
      201: { description: 'Member invited successfully' },
      401: { description: 'Authentication required' },
      403: { description: 'Forbidden' },
      404: { description: 'Project or user not found' },
      409: { description: 'Conflict: User already a member or pending invite' },
      422: { description: 'Validation failed' },
    },
  },
})

export default defineEventHandler((event) => projectManagementController.inviteMember(event))
