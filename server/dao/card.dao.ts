import type { KanbanCard, User, Subtask, CardLabel } from '@prisma/client'

export interface CreateCardData {
  title: string
  description?: string
  dueDate?: Date
  priority?: string
  position: number
  assigneeId?: string
  columnId: string
}

export interface UpdateCardData {
  title?: string
  description?: string | null
  dueDate?: Date | null
  priority?: string
  position?: number
  assigneeId?: string | null
}

export type CardWithDetails = KanbanCard & {
  assignee: User | null
  subtasks: Subtask[]
  labels: CardLabel[]
}

export interface ICardDAO {
  create(data: CreateCardData): Promise<KanbanCard>
  findById(id: string): Promise<KanbanCard | null>
  findByIdWithDetails(id: string): Promise<CardWithDetails | null>
  findByColumnId(columnId: string): Promise<KanbanCard[]>
  update(id: string, data: UpdateCardData): Promise<KanbanCard>
  delete(id: string): Promise<KanbanCard>
  updatePositions(cardPositions: { id: string; position: number }[]): Promise<void>
  moveToColumn(id: string, columnId: string, position: number): Promise<KanbanCard>
  findCardsWithUpcomingDueDate(withinHours: number): Promise<(KanbanCard & { column: { projectId: string } })[]>
}
