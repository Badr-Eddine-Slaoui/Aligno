import type { CardLabel } from '@prisma/client'
import type { ILabelDAO, CreateLabelData, UpdateLabelData } from '../dao/label.dao'
import { prisma } from '../utils/prisma'

export class LabelRepository implements ILabelDAO {
  async create(data: CreateLabelData): Promise<CardLabel> {
    return prisma.cardLabel.create({
      data: {
        name: data.name,
        color: data.color,
        projectId: data.projectId,
      },
    })
  }

  async findById(id: string): Promise<CardLabel | null> {
    return prisma.cardLabel.findUnique({ where: { id } })
  }

  async findByProjectId(projectId: string): Promise<CardLabel[]> {
    return prisma.cardLabel.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    })
  }

  async update(id: string, data: UpdateLabelData): Promise<CardLabel> {
    return prisma.cardLabel.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<CardLabel> {
    return prisma.cardLabel.delete({ where: { id } })
  }

  async assignToCard(cardId: string, labelId: string): Promise<void> {
    await prisma.kanbanCard.update({
      where: { id: cardId },
      data: {
        labels: {
          connect: { id: labelId },
        },
      },
    })
  }

  async removeFromCard(cardId: string, labelId: string): Promise<void> {
    await prisma.kanbanCard.update({
      where: { id: cardId },
      data: {
        labels: {
          disconnect: { id: labelId },
        },
      },
    })
  }

  async setCardLabels(cardId: string, labelIds: string[]): Promise<void> {
    await prisma.kanbanCard.update({
      where: { id: cardId },
      data: {
        labels: {
          set: labelIds.map((id) => ({ id })),
        },
      },
    })
  }
}

export const labelRepository = new LabelRepository()
