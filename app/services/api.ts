import type {
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  User,
  Project,
  ProjectDetail,
  PaginatedProjects,
  ProjectProgress,
  KanbanColumn,
  KanbanCard,
  CardLabel,
  Subtask,
  ProjectMember,
  PaginatedNotifications,
  AppNotification,
} from '~/types'

export const useApiService = () => {
  const apiFetch = useApi()
  const PM = '/project-management'

  return {
    // ─── Auth ────────────────────────────────────────────────────────────────
    auth: {
      async login(payload: Record<string, any>): Promise<ApiResponse<LoginResponse>> {
        return apiFetch('/auth/login', { method: 'POST', body: payload })
      },
      async register(payload: Record<string, any> | FormData): Promise<ApiResponse<RegisterResponse>> {
        return apiFetch('/auth/register', { method: 'POST', body: payload })
      },
      async logout(): Promise<ApiResponse<{ message: string }>> {
        return apiFetch('/auth/logout', { method: 'POST' })
      },
      async me(): Promise<ApiResponse<User>> {
        return apiFetch('/auth/me', { method: 'GET' })
      },
      async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch('/auth/forgot-password', { method: 'POST', body: { email } })
      },
      async resetPassword(payload: Record<string, any>): Promise<ApiResponse<{ message: string }>> {
        return apiFetch('/auth/reset-password', { method: 'POST', body: payload })
      },
      async verifyEmail(payload: Record<string, any>): Promise<ApiResponse<{ message: string }>> {
        return apiFetch('/auth/email/validation', { method: 'POST', body: payload })
      },
      async updateProfile(payload: Record<string, any> | FormData): Promise<ApiResponse<{ user: User }>> {
        return apiFetch('/auth/profile', { method: 'PUT', body: payload })
      },
    },

    // ─── Projects ────────────────────────────────────────────────────────────
    projects: {
      async list(params?: { page?: number; limit?: number; isArchived?: boolean }): Promise<ApiResponse<PaginatedProjects>> {
        return apiFetch(`${PM}/projects`, { method: 'GET', query: params })
      },
      async create(payload: { name: string; description?: string; dueDate?: string; colorCode?: string }): Promise<ApiResponse<ProjectDetail>> {
        return apiFetch(`${PM}/projects`, { method: 'POST', body: payload })
      },
      async get(projectId: string): Promise<ApiResponse<ProjectDetail>> {
        return apiFetch(`${PM}/projects/${projectId}`, { method: 'GET' })
      },
      async update(projectId: string, payload: { name?: string; description?: string; dueDate?: string | null; colorCode?: string }): Promise<ApiResponse<Project>> {
        return apiFetch(`${PM}/projects/${projectId}`, { method: 'PUT', body: payload })
      },
      async delete(projectId: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch(`${PM}/projects/${projectId}`, { method: 'DELETE' })
      },
      async archive(projectId: string): Promise<ApiResponse<Project>> {
        return apiFetch(`${PM}/projects/${projectId}/archive`, { method: 'PUT' })
      },
      async progress(projectId: string): Promise<ApiResponse<ProjectProgress>> {
        return apiFetch(`${PM}/projects/${projectId}/progress`, { method: 'GET' })
      },
    },

    // ─── Columns ─────────────────────────────────────────────────────────────
    columns: {
      async create(projectId: string, payload: { name: string }): Promise<ApiResponse<KanbanColumn>> {
        return apiFetch(`${PM}/projects/${projectId}/columns`, { method: 'POST', body: payload })
      },
      async update(columnId: string, payload: { name: string }): Promise<ApiResponse<KanbanColumn>> {
        return apiFetch(`${PM}/columns/${columnId}`, { method: 'PUT', body: payload })
      },
      async delete(columnId: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch(`${PM}/columns/${columnId}`, { method: 'DELETE' })
      },
      async reorder(projectId: string, payload: { columnIds: string[] }): Promise<ApiResponse<KanbanColumn[]>> {
        return apiFetch(`${PM}/projects/${projectId}/columns/reorder`, { method: 'PUT', body: payload })
      },
    },

    // ─── Cards ───────────────────────────────────────────────────────────────
    cards: {
      async create(columnId: string, payload: { title: string; description?: string; dueDate?: string; priority?: string; assigneeId?: string }): Promise<ApiResponse<KanbanCard>> {
        return apiFetch(`${PM}/columns/${columnId}/cards`, { method: 'POST', body: payload })
      },
      async get(cardId: string): Promise<ApiResponse<KanbanCard>> {
        return apiFetch(`${PM}/cards/${cardId}`, { method: 'GET' })
      },
      async update(cardId: string, payload: { title?: string; description?: string | null; dueDate?: string | null; priority?: string; assigneeId?: string | null }): Promise<ApiResponse<KanbanCard>> {
        return apiFetch(`${PM}/cards/${cardId}`, { method: 'PUT', body: payload })
      },
      async delete(cardId: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch(`${PM}/cards/${cardId}`, { method: 'DELETE' })
      },
      async move(cardId: string, payload: { targetColumnId: string; position: number }): Promise<ApiResponse<KanbanCard>> {
        return apiFetch(`${PM}/cards/${cardId}/move`, { method: 'PUT', body: payload })
      },
      async reorder(columnId: string, payload: { cardIds: string[] }): Promise<ApiResponse<KanbanCard[]>> {
        return apiFetch(`${PM}/columns/${columnId}/cards/reorder`, { method: 'PUT', body: payload })
      },
      async assignLabels(cardId: string, payload: { labelIds: string[] }): Promise<ApiResponse<KanbanCard>> {
        return apiFetch(`${PM}/cards/${cardId}/labels`, { method: 'PUT', body: payload })
      },
    },

    // ─── Labels ──────────────────────────────────────────────────────────────
    labels: {
      async create(projectId: string, payload: { name: string; color: string }): Promise<ApiResponse<CardLabel>> {
        return apiFetch(`${PM}/projects/${projectId}/labels`, { method: 'POST', body: payload })
      },
      async update(labelId: string, payload: { name?: string; color?: string }): Promise<ApiResponse<CardLabel>> {
        return apiFetch(`${PM}/labels/${labelId}`, { method: 'PUT', body: payload })
      },
      async delete(labelId: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch(`${PM}/labels/${labelId}`, { method: 'DELETE' })
      },
    },

    // ─── Subtasks ────────────────────────────────────────────────────────────
    subtasks: {
      async create(cardId: string, payload: { title: string }): Promise<ApiResponse<Subtask>> {
        return apiFetch(`${PM}/cards/${cardId}/subtasks`, { method: 'POST', body: payload })
      },
      async update(subtaskId: string, payload: { title?: string; isCompleted?: boolean }): Promise<ApiResponse<Subtask>> {
        return apiFetch(`${PM}/subtasks/${subtaskId}`, { method: 'PUT', body: payload })
      },
      async delete(subtaskId: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch(`${PM}/subtasks/${subtaskId}`, { method: 'DELETE' })
      },
      async reorder(cardId: string, payload: { subtaskIds: string[] }): Promise<ApiResponse<Subtask[]>> {
        return apiFetch(`${PM}/cards/${cardId}/subtasks/reorder`, { method: 'PUT', body: payload })
      },
    },

    // ─── Members ─────────────────────────────────────────────────────────────
    members: {
      async invite(projectId: string, payload: { email: string; role: 'MEMBER' | 'VISITOR' }): Promise<ApiResponse<{ memberId: string; inviteToken: string }>> {
        return apiFetch(`${PM}/projects/${projectId}/members/invite`, { method: 'POST', body: payload })
      },
      async list(projectId: string): Promise<ApiResponse<ProjectMember[]>> {
        return apiFetch(`${PM}/projects/${projectId}/members`, { method: 'GET' })
      },
      async updateRole(memberId: string, payload: { role: 'ADMIN' | 'MEMBER' | 'VISITOR' }): Promise<ApiResponse<ProjectMember>> {
        return apiFetch(`${PM}/members/${memberId}`, { method: 'PUT', body: payload })
      },
      async remove(memberId: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch(`${PM}/members/${memberId}`, { method: 'DELETE' })
      },
      async acceptInvite(token: string): Promise<ApiResponse<ProjectMember>> {
        return apiFetch(`${PM}/members/invite/accept`, { method: 'POST', body: { token } })
      },
      async declineInvite(token: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch(`${PM}/members/invite/decline`, { method: 'POST', body: { token } })
      },
    },

    // ─── Notifications ────────────────────────────────────────────────────────
    notifications: {
      async list(params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedNotifications>> {
        return apiFetch(`${PM}/notifications`, { method: 'GET', query: params })
      },
      async markRead(notificationId: string): Promise<ApiResponse<AppNotification>> {
        return apiFetch(`${PM}/notifications/${notificationId}/read`, { method: 'PUT' })
      },
      async markAllRead(): Promise<ApiResponse<{ message: string }>> {
        return apiFetch(`${PM}/notifications/read-all`, { method: 'PUT' })
      },
    },
  }
}

