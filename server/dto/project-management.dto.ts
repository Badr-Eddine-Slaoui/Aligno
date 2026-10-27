import type { UserResponseDto } from './auth.dto'

// PROJECTS
export interface CreateProjectRequestDto {
  name: string
  description?: string
  dueDate?: string // ISO 8601 string
  colorCode?: string
}

export interface UpdateProjectRequestDto {
  name?: string
  description?: string
  dueDate?: string | null // ISO 8601 string or null to clear
  colorCode?: string
}

export interface ProjectResponseDto {
  id: string
  name: string
  description: string | null
  dueDate: Date | null
  colorCode: string
  isArchived: boolean
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface ProjectDetailResponseDto extends ProjectResponseDto {
  owner: UserResponseDto
  members: MemberResponseDto[]
  columns: ColumnResponseDto[]
  labels: LabelResponseDto[]
}

export interface PaginatedProjectsResponseDto {
  projects: ProjectResponseDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProjectProgressResponseDto {
  projectId: string
  totalCards: number
  completedCards: number
  progressPercentage: number
}

// COLUMNS
export interface CreateColumnRequestDto {
  name: string
}

export interface UpdateColumnRequestDto {
  name: string
}

export interface ColumnResponseDto {
  id: string
  name: string
  position: number
  projectId: string
  createdAt: Date
  updatedAt: Date
  cards?: CardResponseDto[]
}

export interface ReorderColumnsRequestDto {
  columnIds: string[]
}

// CARDS
export interface CreateCardRequestDto {
  title: string
  description?: string
  dueDate?: string
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  assigneeId?: string
}

export interface UpdateCardRequestDto {
  title?: string
  description?: string | null
  dueDate?: string | null
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  assigneeId?: string | null
}

export interface MoveCardRequestDto {
  targetColumnId: string
  position: number
}

export interface ReorderCardsRequestDto {
  cardIds: string[]
}

export interface CardResponseDto {
  id: string
  title: string
  description: string | null
  dueDate: Date | null
  priority: string
  position: number
  assigneeId: string | null
  columnId: string
  createdAt: Date
  updatedAt: Date
}

export interface CardDetailResponseDto extends CardResponseDto {
  assignee: UserResponseDto | null
  subtasks: SubtaskResponseDto[]
  labels: LabelResponseDto[]
}

// LABELS
export interface CreateLabelRequestDto {
  name: string
  color: string
}

export interface UpdateLabelRequestDto {
  name?: string
  color?: string
}

export interface LabelResponseDto {
  id: string
  name: string
  color: string
  projectId: string
  createdAt: Date
  updatedAt: Date
}

export interface AssignLabelsRequestDto {
  labelIds: string[]
}

// SUBTASKS
export interface CreateSubtaskRequestDto {
  title: string
}

export interface UpdateSubtaskRequestDto {
  title?: string
  isCompleted?: boolean
}

export interface SubtaskResponseDto {
  id: string
  title: string
  isCompleted: boolean
  position: number
  cardId: string
  createdAt: Date
  updatedAt: Date
}

export interface ReorderSubtasksRequestDto {
  subtaskIds: string[]
}

// MEMBERS
export interface InviteMemberRequestDto {
  email: string
  role: 'MEMBER' | 'VISITOR'
}

export interface UpdateMemberRoleRequestDto {
  role: 'ADMIN' | 'MEMBER' | 'VISITOR'
}

export interface MemberResponseDto {
  id: string
  role: string
  userId: string
  projectId: string
  invitedByUserId: string | null
  inviteStatus: string
  createdAt: Date
  updatedAt: Date
  user?: UserResponseDto
}

export interface InviteResponseDto {
  memberId: string
  inviteToken: string
}

// NOTIFICATIONS
export interface NotificationResponseDto {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  metadata: any | null
  userId: string
  createdAt: Date
}

export interface PaginatedNotificationsResponseDto {
  notifications: NotificationResponseDto[]
  total: number
  page: number
  limit: number
  totalPages: number
  unreadCount: number
}
