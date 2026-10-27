import type { H3Event } from 'h3'
import type { ZodError } from 'zod'
import { logger } from '../utils/logger'
import { sentry } from '../utils/sentry'
import {
  projectService
} from '../service/project.service'
import {
  columnService
} from '../service/column.service'
import {
  cardService
} from '../service/card.service'
import {
  subtaskService
} from '../service/subtask.service'
import {
  memberService
} from '../service/member.service'
import {
  notificationService
} from '../service/notification.service'
import {
  createProjectSchema,
  updateProjectSchema,
  createColumnSchema,
  updateColumnSchema,
  reorderColumnsSchema,
  createCardSchema,
  updateCardSchema,
  moveCardSchema,
  reorderCardsSchema,
  createLabelSchema,
  updateLabelSchema,
  assignLabelsSchema,
  createSubtaskSchema,
  updateSubtaskSchema,
  reorderSubtasksSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  inviteTokenSchema,
  paginationSchema,
  notificationPaginationSchema
} from '../validations/project-management.zod'
import { labelRepository } from '../repository/label.repository'
import { LabelMapper } from '../mapper/project.mapper'

function formatZodErrors(error: ZodError) {
  const errors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (!errors[key]) {
      errors[key] = []
    }
    errors[key]!.push(issue.message)
  }
  return errors
}

export class ProjectManagementController {
  // PROJECTS
  async createProject(event: H3Event) {
    logger.info('Handling project creation request')
    try {
      const body = await readBody(event)
      const result = createProjectSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const userId = event.context.userId as string
      const project = await projectService.createProject(result.data, userId)

      setResponseStatus(event, 201)
      return { success: true, data: project }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async listProjects(event: H3Event) {
    logger.info('Handling list projects request')
    try {
      const query = getQuery(event)
      const result = paginationSchema.safeParse(query)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const userId = event.context.userId as string
      const data = await projectService.listProjects(userId, result.data)

      return { success: true, data }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getProjectDetail(event: H3Event) {
    try {
      const projectId = event.context.projectId as string
      logger.info(`Fetching details for project: ${projectId}`)
      const project = await projectService.getProjectDetail(projectId)
      return { success: true, data: project }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async updateProject(event: H3Event) {
    try {
      const projectId = event.context.projectId as string
      logger.info(`Updating project: ${projectId}`)
      const body = await readBody(event)
      const result = updateProjectSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const project = await projectService.updateProject(projectId, result.data)
      return { success: true, data: project }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async deleteProject(event: H3Event) {
    try {
      const projectId = event.context.projectId as string
      logger.info(`Deleting project: ${projectId}`)
      await projectService.deleteProject(projectId)
      return { success: true, data: { message: 'Project deleted successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async archiveProject(event: H3Event) {
    try {
      const projectId = event.context.projectId as string
      logger.info(`Toggling archive for project: ${projectId}`)
      const project = await projectService.archiveProject(projectId)
      return { success: true, data: project }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getProjectProgress(event: H3Event) {
    try {
      const projectId = event.context.projectId as string
      logger.info(`Getting progress for project: ${projectId}`)
      const progress = await projectService.getProjectProgress(projectId)
      return { success: true, data: progress }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  // COLUMNS
  async createColumn(event: H3Event) {
    try {
      const projectId = event.context.projectId as string
      logger.info(`Creating column in project: ${projectId}`)
      const body = await readBody(event)
      const result = createColumnSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const column = await columnService.createColumn(projectId, result.data)
      setResponseStatus(event, 201)
      return { success: true, data: column }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async updateColumn(event: H3Event) {
    try {
      const columnId = event.context.params?.columnId as string
      logger.info(`Updating column: ${columnId}`)
      const body = await readBody(event)
      const result = updateColumnSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const column = await columnService.updateColumn(columnId, result.data)
      return { success: true, data: column }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async deleteColumn(event: H3Event) {
    try {
      const columnId = event.context.params?.columnId as string
      logger.info(`Deleting column: ${columnId}`)
      await columnService.deleteColumn(columnId)
      return { success: true, data: { message: 'Column deleted successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async reorderColumns(event: H3Event) {
    try {
      const projectId = event.context.projectId as string
      logger.info(`Reordering columns in project: ${projectId}`)
      const body = await readBody(event)
      const result = reorderColumnsSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const columns = await columnService.reorderColumns(projectId, result.data.columnIds)
      return { success: true, data: columns }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  // CARDS
  async createCard(event: H3Event) {
    try {
      const columnId = event.context.params?.columnId as string
      logger.info(`Creating card in column: ${columnId}`)
      const body = await readBody(event)
      const result = createCardSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const creatorId = event.context.userId as string
      const card = await cardService.createCard(columnId, result.data, creatorId)
      setResponseStatus(event, 201)
      return { success: true, data: card }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getCardDetail(event: H3Event) {
    try {
      const cardId = event.context.params?.cardId as string
      logger.info(`Getting details for card: ${cardId}`)
      const card = await cardService.getCardDetail(cardId)
      return { success: true, data: card }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async updateCard(event: H3Event) {
    try {
      const cardId = event.context.params?.cardId as string
      logger.info(`Updating card: ${cardId}`)
      const body = await readBody(event)
      const result = updateCardSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const updaterId = event.context.userId as string
      const card = await cardService.updateCard(cardId, result.data, updaterId)
      return { success: true, data: card }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async deleteCard(event: H3Event) {
    try {
      const cardId = event.context.params?.cardId as string
      logger.info(`Deleting card: ${cardId}`)
      await cardService.deleteCard(cardId)
      return { success: true, data: { message: 'Card deleted successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async moveCard(event: H3Event) {
    try {
      const cardId = event.context.params?.cardId as string
      logger.info(`Moving card: ${cardId}`)
      const body = await readBody(event)
      const result = moveCardSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const card = await cardService.moveCard(cardId, result.data)
      return { success: true, data: card }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async reorderCards(event: H3Event) {
    try {
      const columnId = event.context.params?.columnId as string
      logger.info(`Reordering cards in column: ${columnId}`)
      const body = await readBody(event)
      const result = reorderCardsSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const cards = await cardService.reorderCards(columnId, result.data.cardIds)
      return { success: true, data: cards }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  // LABELS
  async createLabel(event: H3Event) {
    try {
      const projectId = event.context.projectId as string
      logger.info(`Creating label in project: ${projectId}`)
      const body = await readBody(event)
      const result = createLabelSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const label = await labelRepository.create({
        name: result.data.name,
        color: result.data.color,
        projectId,
      })

      const response = LabelMapper.toResponseDto(label)
      setResponseStatus(event, 201)
      return { success: true, data: response }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async updateLabel(event: H3Event) {
    try {
      const labelId = event.context.params?.labelId as string
      logger.info(`Updating label: ${labelId}`)
      const body = await readBody(event)
      const result = updateLabelSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const label = await labelRepository.update(labelId, result.data)
      const response = LabelMapper.toResponseDto(label)
      return { success: true, data: response }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async deleteLabel(event: H3Event) {
    try {
      const labelId = event.context.params?.labelId as string
      logger.info(`Deleting label: ${labelId}`)
      await labelRepository.delete(labelId)
      return { success: true, data: { message: 'Label deleted successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async assignCardLabels(event: H3Event) {
    try {
      const cardId = event.context.params?.cardId as string
      logger.info(`Assigning labels to card: ${cardId}`)
      const body = await readBody(event)
      const result = assignLabelsSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      await labelRepository.setCardLabels(cardId, result.data.labelIds)
      const card = await cardService.getCardDetail(cardId)
      return { success: true, data: card }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  // SUBTASKS
  async createSubtask(event: H3Event) {
    try {
      const cardId = event.context.params?.cardId as string
      logger.info(`Creating subtask in card: ${cardId}`)
      const body = await readBody(event)
      const result = createSubtaskSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const subtask = await subtaskService.createSubtask(cardId, result.data)
      setResponseStatus(event, 201)
      return { success: true, data: subtask }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async updateSubtask(event: H3Event) {
    try {
      const subtaskId = event.context.params?.subtaskId as string
      logger.info(`Updating subtask: ${subtaskId}`)
      const body = await readBody(event)
      const result = updateSubtaskSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const subtask = await subtaskService.updateSubtask(subtaskId, result.data)
      return { success: true, data: subtask }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async deleteSubtask(event: H3Event) {
    try {
      const subtaskId = event.context.params?.subtaskId as string
      logger.info(`Deleting subtask: ${subtaskId}`)
      await subtaskService.deleteSubtask(subtaskId)
      return { success: true, data: { message: 'Subtask deleted successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async reorderSubtasks(event: H3Event) {
    try {
      const cardId = event.context.params?.cardId as string
      logger.info(`Reordering subtasks in card: ${cardId}`)
      const body = await readBody(event)
      const result = reorderSubtasksSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const subtasks = await subtaskService.reorderSubtasks(cardId, result.data.subtaskIds)
      return { success: true, data: subtasks }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  // MEMBERS
  async inviteMember(event: H3Event) {
    try {
      const projectId = event.context.projectId as string
      logger.info(`Inviting member to project: ${projectId}`)
      const body = await readBody(event)
      const result = inviteMemberSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const inviterId = event.context.userId as string
      const invite = await memberService.inviteMember(projectId, result.data, inviterId)
      setResponseStatus(event, 201)
      return { success: true, data: invite }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async listMembers(event: H3Event) {
    try {
      const projectId = event.context.projectId as string
      logger.info(`Listing members for project: ${projectId}`)
      const members = await memberService.listMembers(projectId)
      return { success: true, data: members }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async updateMemberRole(event: H3Event) {
    try {
      const memberId = event.context.params?.memberId as string
      logger.info(`Updating role for member: ${memberId}`)
      const body = await readBody(event)
      const result = updateMemberRoleSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const updaterId = event.context.userId as string
      const member = await memberService.updateMemberRole(memberId, result.data, updaterId)
      return { success: true, data: member }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async removeMember(event: H3Event) {
    try {
      const memberId = event.context.params?.memberId as string
      logger.info(`Removing member: ${memberId}`)
      const removerId = event.context.userId as string
      await memberService.removeMember(memberId, removerId)
      return { success: true, data: { message: 'Member removed successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async acceptInvite(event: H3Event) {
    try {
      const body = await readBody(event)
      const result = inviteTokenSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const member = await memberService.acceptInvitation(result.data.token)
      return { success: true, data: member }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async declineInvite(event: H3Event) {
    try {
      const body = await readBody(event)
      const result = inviteTokenSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      await memberService.declineInvitation(result.data.token)
      return { success: true, data: { message: 'Invitation declined successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  // NOTIFICATIONS
  async listNotifications(event: H3Event) {
    try {
      const query = getQuery(event)
      const result = notificationPaginationSchema.safeParse(query)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const userId = event.context.userId as string
      const notifications = await notificationService.listNotifications(userId, result.data)
      return { success: true, data: notifications }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async markNotificationRead(event: H3Event) {
    try {
      const notificationId = event.context.params?.notificationId as string
      const userId = event.context.userId as string
      logger.info(`Marking notification ${notificationId} read for user ${userId}`)
      const notif = await notificationService.markAsRead(notificationId, userId)
      return { success: true, data: notif }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async markAllNotificationsRead(event: H3Event) {
    try {
      const userId = event.context.userId as string
      logger.info(`Marking all notifications read for user: ${userId}`)
      const result = await notificationService.markAllAsRead(userId)
      return { success: true, data: result }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }
}

export const projectManagementController = new ProjectManagementController()
