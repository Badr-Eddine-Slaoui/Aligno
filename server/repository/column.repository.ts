import type { KanbanColumn } from '@prisma/client'
import type { IColumnDAO, CreateColumnData, UpdateColumnData } from '../dao/column.dao'
import { prisma } from '../utils/prisma'

export class ColumnRepository implements IColumnDAO {
  async create(data: CreateColumnData): Promise<KanbanColumn> {
    return prisma.kanbanColumn.create({
      data: {
        name: data.name,
        position: data.position,
        projectId: data.projectId,
      },
    })
  }

  async findById(id: string): Promise<KanbanColumn | null> {
    return prisma.kanbanColumn.findUnique({ where: { id } })
  }

  async findByProjectId(projectId: string): Promise<KanbanColumn[]> {
    return prisma.kanbanColumn.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    })
  }

  async update(id: string, data: UpdateColumnData): Promise<KanbanColumn> {
    return prisma.kanbanColumn.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<KanbanColumn> {
    return prisma.kanbanColumn.delete({ where: { id } })
  }

  async updatePositions(columnPositions: { id: string; position: number }[]): Promise<void> {
    await prisma.$transaction(
      columnPositions.map((col) =>
        prisma.kanbanColumn.update({
          where: { id: col.id },
          data: { position: col.position },
        }),
      ),
    )
  }
}

export const columnRepository = new ColumnRepository()
