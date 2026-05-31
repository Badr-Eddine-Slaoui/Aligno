import type { Project, User, ProjectMember, KanbanColumn, KanbanCard, CardLabel, Subtask } from '@prisma/client'

export interface CreateProjectData {
  name: string
  description?: string
  dueDate?: Date
  colorCode?: string
  ownerId: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  dueDate?: Date | null
  colorCode?: string
  isArchived?: boolean
}

export type ProjectWithDetails = Project & {
  owner: User
  members: (ProjectMember & { user: User })[]
  columns: (KanbanColumn & { cards: (KanbanCard & { assignee: User | null; subtasks: Subtask[]; labels: CardLabel[] })[] })[]
  labels: CardLabel[]
}

export interface IProjectDAO {
  create(data: CreateProjectData): Promise<Project>
  findById(id: string): Promise<Project | null>
  findByIdWithDetails(id: string): Promise<ProjectWithDetails | null>
  findByUserId(
    userId: string,
    options: { page: number; limit: number; isArchived?: boolean },
  ): Promise<{ projects: Project[]; total: number }>
  update(id: string, data: UpdateProjectData): Promise<Project>
  delete(id: string): Promise<Project>
  countCardsByStatus(id: string): Promise<{ total: number; completed: number }>
}
