import { prisma } from '../utils/prisma'
import { logger } from '../utils/logger'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  const method = getMethod(event)
  const userId = event.context.userId

  // Only run role check for project-management endpoints
  if (!path.startsWith('/api/project-management/')) return

  // Skip global/individual actions that don't depend on a specific project context
  if (
    path === '/api/project-management/projects' ||
    path.startsWith('/api/project-management/notifications') ||
    path.startsWith('/api/project-management/members/invite/accept') ||
    path.startsWith('/api/project-management/members/invite/decline')
  ) {
    return
  }

  // 1. Resolve projectId from the URL pathname
  let projectId: string | null = null
  const segments = path.split('/').filter(Boolean) // e.g. ["api", "project-management", "projects", "clx...", "archive"]

  try {
    const resourceType = segments[2] // 'projects', 'columns', 'cards', 'labels', 'subtasks', 'members'
    const resourceId = segments[3]

    if (resourceType === 'projects' && resourceId) {
      projectId = resourceId
    } else if (resourceType === 'columns' && resourceId) {
      const col = await prisma.kanbanColumn.findUnique({
        where: { id: resourceId },
        select: { projectId: true },
      })
      projectId = col?.projectId || null
    } else if (resourceType === 'cards' && resourceId) {
      const card = await prisma.kanbanCard.findUnique({
        where: { id: resourceId },
        select: { column: { select: { projectId: true } } },
      })
      projectId = card?.column?.projectId || null
    } else if (resourceType === 'labels' && resourceId) {
      const label = await prisma.cardLabel.findUnique({
        where: { id: resourceId },
        select: { projectId: true },
      })
      projectId = label?.projectId || null
    } else if (resourceType === 'subtasks' && resourceId) {
      const sub = await prisma.subtask.findUnique({
        where: { id: resourceId },
        select: { card: { select: { column: { select: { projectId: true } } } } },
      })
      projectId = sub?.card?.column?.projectId || null
    } else if (resourceType === 'members' && resourceId) {
      const member = await prisma.projectMember.findUnique({
        where: { id: resourceId },
        select: { projectId: true, userId: true },
      })
      projectId = member?.projectId || null

      // Exception: Anyone can delete their own membership (i.e. leave project)
      if (resourceId && method === 'DELETE' && member && member.userId === userId) {
        // Set context and bypass other checks
        event.context.projectId = projectId
        event.context.projectRole = 'MEMBER' // Treated as member for the delete request
        return
      }
    }

    if (!projectId) {
      throw createError({ statusCode: 404, statusMessage: 'Project context not found' })
    }

    // 2. Fetch user's membership role
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    })

    if (!membership || membership.inviteStatus !== 'ACCEPTED') {
      logger.warn(`User ${userId} attempted unauthorized access to project ${projectId}`)
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: You are not a member of this project' })
    }

    const role = membership.role // 'ADMIN', 'MEMBER', 'VISITOR'

    // 3. Define permission requirements
    let requiredRole = 'VISITOR' // Default: read-only access (GET)

    const isAdminOnly =
      (resourceType === 'projects' && resourceId && ['PUT', 'DELETE'].includes(method)) ||
      (path.endsWith('/archive') && method === 'PUT') ||
      (path.endsWith('/members/invite') && method === 'POST') ||
      (resourceType === 'members' && method === 'PUT') ||
      (resourceType === 'members' && method === 'DELETE') // Enforced ADMIN-only for removing others

    const isWriteAction = ['POST', 'PUT', 'DELETE'].includes(method)

    if (isAdminOnly) {
      requiredRole = 'ADMIN'
    } else if (isWriteAction) {
      requiredRole = 'MEMBER' // Enforces ADMIN or MEMBER
    }

    // 4. Validate roles
    if (requiredRole === 'ADMIN' && role !== 'ADMIN') {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin role required for this action' })
    }

    if (requiredRole === 'MEMBER' && !['ADMIN', 'MEMBER'].includes(role)) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Member role required for this action' })
    }

    // 5. Populate contexts
    event.context.projectId = projectId
    event.context.projectRole = role
  } catch (err: any) {
    if (err.statusCode) throw err
    logger.error('Project role middleware error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Internal server validation error' })
  }
})
