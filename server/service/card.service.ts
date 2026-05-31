import { cardRepository } from '../repository/card.repository'
import { columnRepository } from '../repository/column.repository'
import { memberRepository } from '../repository/member.repository'
import { CardMapper } from '../mapper/project.mapper'
import { scheduleCardReminder, cancelCardReminder } from '../utils/queue'
import { emitToProject, emitToUser } from '../utils/socket'
import { emailService } from './email.service'
import { notificationRepository } from '../repository/notification.repository'
import type {
  CreateCardRequestDto,
  UpdateCardRequestDto,
  CardResponseDto,
  CardDetailResponseDto,
  MoveCardRequestDto,
} from '../dto/project-management.dto'

export class CardService {
  async createCard(columnId: string, data: CreateCardRequestDto, creatorId: string): Promise<CardDetailResponseDto> {
    const col = await columnRepository.findById(columnId)
    if (!col) {
      throw createError({ statusCode: 404, statusMessage: 'Column not found' })
    }

    const existingCards = await cardRepository.findByColumnId(columnId)
    const position = existingCards.length

    let assigneeId: string | undefined = undefined
    if (data.assigneeId) {
      const membership = await memberRepository.findByUserAndProject(data.assigneeId, col.projectId)
      if (!membership || membership.inviteStatus !== 'ACCEPTED') {
        throw createError({ statusCode: 400, statusMessage: 'Assignee must be an accepted project member' })
      }
      assigneeId = data.assigneeId
    }

    const dueDate = data.dueDate ? new Date(data.dueDate) : undefined

    const card = await cardRepository.create({
      title: data.title,
      description: data.description,
      dueDate,
      priority: data.priority,
      position,
      assigneeId,
      columnId,
    })

    // Schedule reminder if card has a due date
    if (dueDate) {
      await scheduleCardReminder(card.id, dueDate)
    }

    // Send notifications if assignee is set
    if (assigneeId && assigneeId !== creatorId) {
      const creatorMembership = await memberRepository.findByUserAndProject(creatorId, col.projectId)
      const creatorUser = await prisma.user.findUnique({ where: { id: creatorId } })
      const assigneeUser = await prisma.user.findUnique({ where: { id: assigneeId } })
      const project = await prisma.project.findUnique({ where: { id: col.projectId } })

      if (assigneeUser && creatorUser && project) {
        const assignerName = `${creatorUser.firstName} ${creatorUser.lastName}`
        await emailService.sendCardAssignedEmail(
          assigneeUser.email,
          assigneeUser.firstName,
          card.title,
          project.name,
          assignerName,
        )

        const notif = await notificationRepository.create({
          type: 'CARD_ASSIGNED',
          title: 'Task Assigned',
          message: `${assignerName} assigned the task "${card.title}" to you.`,
          metadata: { cardId: card.id, projectId: project.id },
          userId: assigneeId,
        })
        emitToUser(assigneeId, 'notification:new', { notification: notif })
      }
    }

    const detailCard = await cardRepository.findByIdWithDetails(card.id)
    if (!detailCard) {
      throw createError({ statusCode: 404, statusMessage: 'Card not found after creation' })
    }

    const response = CardMapper.toDetailResponseDto(detailCard, detailCard.assignee, detailCard.subtasks, detailCard.labels)
    emitToProject(col.projectId, 'board:card:created', { card: response, columnId })

    return response
  }

  async getCardDetail(cardId: string): Promise<CardDetailResponseDto> {
    const card = await cardRepository.findByIdWithDetails(cardId)
    if (!card) {
      throw createError({ statusCode: 404, statusMessage: 'Card not found' })
    }
    return CardMapper.toDetailResponseDto(card, card.assignee, card.subtasks, card.labels)
  }

  async updateCard(cardId: string, data: UpdateCardRequestDto, updaterId: string): Promise<CardDetailResponseDto> {
    const card = await cardRepository.findByIdWithDetails(cardId)
    if (!card) {
      throw createError({ statusCode: 404, statusMessage: 'Card not found' })
    }

    const col = await columnRepository.findById(card.columnId)
    if (!col) {
      throw createError({ statusCode: 404, statusMessage: 'Column not found for card' })
    }

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.priority !== undefined) updateData.priority = data.priority

    // Handle due date changes
    if (data.dueDate !== undefined) {
      if (data.dueDate === null) {
        updateData.dueDate = null
        updateData.dueDateReminderSent = false
        await cancelCardReminder(cardId)
      } else {
        const dueDate = new Date(data.dueDate)
        updateData.dueDate = dueDate
        updateData.dueDateReminderSent = false
        await scheduleCardReminder(cardId, dueDate)
      }
    }

    // Handle assignee changes
    if (data.assigneeId !== undefined) {
      if (data.assigneeId === null) {
        updateData.assigneeId = null
      } else {
        const membership = await memberRepository.findByUserAndProject(data.assigneeId, col.projectId)
        if (!membership || membership.inviteStatus !== 'ACCEPTED') {
          throw createError({ statusCode: 400, statusMessage: 'Assignee must be an accepted project member' })
        }
        updateData.assigneeId = data.assigneeId

        // Notify if changed and not self-assignment
        if (card.assigneeId !== data.assigneeId && data.assigneeId !== updaterId) {
          const updaterUser = await prisma.user.findUnique({ where: { id: updaterId } })
          const assigneeUser = await prisma.user.findUnique({ where: { id: data.assigneeId } })
          const project = await prisma.project.findUnique({ where: { id: col.projectId } })

          if (assigneeUser && updaterUser && project) {
            const assignerName = `${updaterUser.firstName} ${updaterUser.lastName}`
            await emailService.sendCardAssignedEmail(
              assigneeUser.email,
              assigneeUser.firstName,
              data.title || card.title,
              project.name,
              assignerName,
            )

            const notif = await notificationRepository.create({
              type: 'CARD_ASSIGNED',
              title: 'Task Assigned',
              message: `${assignerName} assigned the task "${data.title || card.title}" to you.`,
              metadata: { cardId: card.id, projectId: project.id },
              userId: data.assigneeId,
            })
            emitToUser(data.assigneeId, 'notification:new', { notification: notif })
          }
        }
      }
    }

    const updated = await cardRepository.update(cardId, updateData)
    const detailCard = await cardRepository.findByIdWithDetails(cardId)
    if (!detailCard) {
      throw createError({ statusCode: 404, statusMessage: 'Card not found' })
    }

    const response = CardMapper.toDetailResponseDto(detailCard, detailCard.assignee, detailCard.subtasks, detailCard.labels)
    emitToProject(col.projectId, 'board:card:updated', { card: response })

    return response
  }

  async deleteCard(cardId: string): Promise<void> {
    const card = await cardRepository.findById(cardId)
    if (!card) {
      throw createError({ statusCode: 404, statusMessage: 'Card not found' })
    }

    const col = await columnRepository.findById(card.columnId)
    if (!col) {
      throw createError({ statusCode: 404, statusMessage: 'Column not found' })
    }

    // Cancel due date reminder
    await cancelCardReminder(cardId)

    await cardRepository.delete(cardId)

    // Reorder remaining cards in this column
    const existing = await cardRepository.findByColumnId(card.columnId)
    const updates = existing.map((c, index) => ({ id: c.id, position: index }))
    await cardRepository.updatePositions(updates)

    emitToProject(col.projectId, 'board:card:deleted', { cardId, columnId: card.columnId })
  }

  async moveCard(cardId: string, data: MoveCardRequestDto): Promise<CardDetailResponseDto> {
    const card = await cardRepository.findById(cardId)
    if (!card) {
      throw createError({ statusCode: 404, statusMessage: 'Card not found' })
    }

    const sourceCol = await columnRepository.findById(card.columnId)
    const targetCol = await columnRepository.findById(data.targetColumnId)

    if (!sourceCol || !targetCol) {
      throw createError({ statusCode: 404, statusMessage: 'Column not found' })
    }

    if (sourceCol.projectId !== targetCol.projectId) {
      throw createError({ statusCode: 400, statusMessage: 'Cannot move card to a different project' })
    }

    const targetCards = await cardRepository.findByColumnId(data.targetColumnId)

    if (card.columnId === data.targetColumnId) {
      // Reordering within the same column
      const filtered = targetCards.filter((c) => c.id !== cardId)
      
      // Insert card at target position
      filtered.splice(data.position, 0, card)

      const updates = filtered.map((c, index) => ({ id: c.id, position: index }))
      await cardRepository.updatePositions(updates)
    } else {
      // Moving across columns
      // 1. Remove from source column and reorder remaining
      const sourceCards = await cardRepository.findByColumnId(card.columnId)
      const remainingSource = sourceCards.filter((c) => c.id !== cardId)
      const sourceUpdates = remainingSource.map((c, index) => ({ id: c.id, position: index }))
      await cardRepository.updatePositions(sourceUpdates)

      // 2. Insert into target column at target position
      targetCards.splice(data.position, 0, card)
      const targetUpdates = targetCards.map((c, index) => ({ id: c.id, position: index }))
      await cardRepository.updatePositions(targetUpdates)

      // 3. Update the moved card's columnId and position
      await cardRepository.moveToColumn(cardId, data.targetColumnId, data.position)
    }

    const detailCard = await cardRepository.findByIdWithDetails(cardId)
    if (!detailCard) {
      throw createError({ statusCode: 404, statusMessage: 'Card not found' })
    }

    const response = CardMapper.toDetailResponseDto(detailCard, detailCard.assignee, detailCard.subtasks, detailCard.labels)
    emitToProject(
      sourceCol.projectId,
      'board:card:moved',
      { cardId, fromColumnId: card.columnId, toColumnId: data.targetColumnId, position: data.position, card: response }
    )

    return response
  }

  async reorderCards(columnId: string, cardIds: string[]): Promise<CardResponseDto[]> {
    const col = await columnRepository.findById(columnId)
    if (!col) {
      throw createError({ statusCode: 404, statusMessage: 'Column not found' })
    }

    const existing = await cardRepository.findByColumnId(columnId)
    const existingIds = existing.map((c) => c.id)

    const isValid = cardIds.every((id) => existingIds.includes(id)) && cardIds.length === existingIds.length
    if (!isValid) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid card list provided for reordering' })
    }

    const updates = cardIds.map((id, index) => ({ id, position: index }))
    await cardRepository.updatePositions(updates)

    const updated = await cardRepository.findByColumnId(columnId)
    const responses = updated.map((c) => CardMapper.toResponseDto(c))

    return responses
  }
}

import { prisma } from '../utils/prisma'

export const cardService = new CardService()
