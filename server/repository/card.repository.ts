import type { KanbanCard } from '@prisma/client'
import type { ICardDAO, CreateCardData, UpdateCardData, CardWithDetails } from '../dao/card.dao'
import { prisma } from '../utils/prisma'

export class CardRepository implements ICardDAO {
  async create(data: CreateCardData): Promise<KanbanCard> {
    return prisma.kanbanCard.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority || 'MEDIUM',
        position: data.position,
        assigneeId: data.assigneeId,
        columnId: data.columnId,
      },
    })
  }

  async findById(id: string): Promise<KanbanCard | null> {
    return prisma.kanbanCard.findUnique({ where: { id } })
  }

  async findByIdWithDetails(id: string): Promise<CardWithDetails | null> {
    return prisma.kanbanCard.findUnique({
      where: { id },
      include: {
        assignee: true,
        subtasks: true,
        labels: true,
      },
    }) as Promise<CardWithDetails | null>
  }

  async findByColumnId(columnId: string): Promise<KanbanCard[]> {
    return prisma.kanbanCard.findMany({
      where: { columnId },
      orderBy: { position: 'asc' },
    })
  }

  async update(id: string, data: UpdateCardData): Promise<KanbanCard> {
    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.position !== undefined) updateData.position = data.position
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId

    return prisma.kanbanCard.update({
      where: { id },
      data: updateData,
    })
  }

  async delete(id: string): Promise<KanbanCard> {
    return prisma.kanbanCard.delete({ where: { id } })
  }

  async updatePositions(cardPositions: { id: string; position: number }[]): Promise<void> {
    await prisma.$transaction(
      cardPositions.map((card) =>
        prisma.kanbanCard.update({
          where: { id: card.id },
          data: { position: card.position },
        }),
      ),
    )
  }

  async moveToColumn(id: string, columnId: string, position: number): Promise<KanbanCard> {
    return prisma.kanbanCard.update({
      where: { id },
      data: { columnId, position },
    })
  }

  async findCardsWithUpcomingDueDate(withinHours: number): Promise<(KanbanCard & { column: { projectId: string } })[]> {
    const now = new Date()
    const targetDate = new Date(now.getTime() + withinHours * 60 * 60 * 1000)

    return prisma.kanbanCard.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: targetDate,
        },
        dueDateReminderSent: false,
      },
      include: {
        column: {
          select: {
            projectId: true,
          },
        },
      },
    })
  }
}

export const cardRepository = new CardRepository()
