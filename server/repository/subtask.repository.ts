import type { Subtask } from '@prisma/client'
import type { ISubtaskDAO, CreateSubtaskData, UpdateSubtaskData } from '../dao/subtask.dao'
import { prisma } from '../utils/prisma'

export class SubtaskRepository implements ISubtaskDAO {
  async create(data: CreateSubtaskData): Promise<Subtask> {
    return prisma.subtask.create({
      data: {
        title: data.title,
        position: data.position,
        cardId: data.cardId,
      },
    })
  }

  async findById(id: string): Promise<Subtask | null> {
    return prisma.subtask.findUnique({ where: { id } })
  }

  async findByCardId(cardId: string): Promise<Subtask[]> {
    return prisma.subtask.findMany({
      where: { cardId },
      orderBy: { position: 'asc' },
    })
  }

  async update(id: string, data: UpdateSubtaskData): Promise<Subtask> {
    return prisma.subtask.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<Subtask> {
    return prisma.subtask.delete({ where: { id } })
  }

  async updatePositions(subtaskPositions: { id: string; position: number }[]): Promise<void> {
    await prisma.$transaction(
      subtaskPositions.map((sub) =>
        prisma.subtask.update({
          where: { id: sub.id },
          data: { position: sub.position },
        }),
      ),
    )
  }
}

export const subtaskRepository = new SubtaskRepository()
