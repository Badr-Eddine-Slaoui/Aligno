import type { KanbanColumn } from '@prisma/client'

export interface CreateColumnData {
  name: string
  position: number
  projectId: string
}

export interface UpdateColumnData {
  name?: string
  position?: number
}

export interface IColumnDAO {
  create(data: CreateColumnData): Promise<KanbanColumn>
  findById(id: string): Promise<KanbanColumn | null>
  findByProjectId(projectId: string): Promise<KanbanColumn[]>
  update(id: string, data: UpdateColumnData): Promise<KanbanColumn>
  delete(id: string): Promise<KanbanColumn>
  updatePositions(columnPositions: { id: string; position: number }[]): Promise<void>
}
