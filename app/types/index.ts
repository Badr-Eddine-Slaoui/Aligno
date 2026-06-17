export interface User {
  id: string
  firstName: string
  lastName: string
  age: number
  email: string
  phone: string
  profilePictureUrl: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiError {
  statusCode: number
  statusMessage: string
  data?: { errors?: Record<string, string[]> }
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RegisterResponse {
  message: string
  user: User
}

// ─── Project Management ──────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  description: string | null
  dueDate: string | null
  colorCode: string
  isArchived: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: string
  role: 'ADMIN' | 'MEMBER' | 'VISITOR'
  userId: string
  projectId: string
  invitedByUserId: string | null
  inviteStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  inviteToken?: string
  createdAt: string
  updatedAt: string
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'profilePictureUrl'>
}

export interface CardLabel {
  id: string
  name: string
  color: string
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface Subtask {
  id: string
  title: string
  isCompleted: boolean
  position: number
  cardId: string
  createdAt: string
  updatedAt: string
}

export interface KanbanCard {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  position: number
  assigneeId: string | null
  columnId: string
  createdAt: string
  updatedAt: string
  assignee?: Pick<User, 'id' | 'firstName' | 'lastName' | 'profilePictureUrl'> | null
  subtasks?: Subtask[]
  labels?: CardLabel[]
}

export interface KanbanColumn {
  id: string
  name: string
  position: number
  projectId: string
  createdAt: string
  updatedAt: string
  cards: KanbanCard[]
}

export interface ProjectDetail extends Project {
  owner: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'profilePictureUrl'>
  members: ProjectMember[]
  columns: KanbanColumn[]
  labels: CardLabel[]
}

export interface PaginatedProjects {
  projects: Project[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProjectProgress {
  projectId: string
  totalCards: number
  completedCards: number
  progressPercentage: number
}

export interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  metadata: Record<string, any> | null
  userId: string
  createdAt: string
}

export interface PaginatedNotifications {
  notifications: AppNotification[]
  total: number
  page: number
  limit: number
  totalPages: number
  unreadCount: number
}

