import type { Subtask } from '@prisma/client'

export interface CreateSubtaskData {
  title: string
  position: number
  cardId: string
}

export interface UpdateSubtaskData {
  title?: string
  isCompleted?: boolean
  position?: number
}

export interface ISubtaskDAO {
  create(data: CreateSubtaskData): Promise<Subtask>
  findById(id: string): Promise<Subtask | null>
  findByCardId(cardId: string): Promise<Subtask[]>
  update(id: string, data: UpdateSubtaskData): Promise<Subtask>
  delete(id: string): Promise<Subtask>
  updatePositions(subtaskPositions: { id: string; position: number }[]): Promise<void>
}
