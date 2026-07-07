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
  BankAccount,
  Transaction,
  Subscription,
  Budget,
  MonthlyChartResponse,
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

    // ─── Wallet ───────────────────────────────────────────────────────────────
    wallet: {
      async listBankAccounts(): Promise<ApiResponse<BankAccount[]>> {
        return apiFetch('/wallet/bank-accounts', { method: 'GET' })
      },
      async createBankAccount(payload: { name: string; bankName?: string; accountNumber?: string; balance?: number; currency?: string }): Promise<ApiResponse<BankAccount>> {
        return apiFetch('/wallet/bank-accounts', { method: 'POST', body: payload })
      },
      async getBankAccount(id: string): Promise<ApiResponse<BankAccount>> {
        return apiFetch(`/wallet/bank-accounts/${id}`, { method: 'GET' })
      },
      async updateBankAccount(id: string, payload: { name?: string; bankName?: string; accountNumber?: string; balance?: number; currency?: string }): Promise<ApiResponse<BankAccount>> {
        return apiFetch(`/wallet/bank-accounts/${id}`, { method: 'PUT', body: payload })
      },
      async deleteBankAccount(id: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch(`/wallet/bank-accounts/${id}`, { method: 'DELETE' })
      },

      // Subscriptions
      async listSubscriptions(bankAccountId: string): Promise<ApiResponse<Subscription[]>> {
        return apiFetch('/wallet/subscriptions', { method: 'GET', query: { bankAccountId } })
      },
      async createSubscription(payload: { name: string; status: 'INCOME' | 'EXPENSE'; amount: number; category: string; paymentMethod: string; isPaid?: boolean; startDate?: string; endDate?: string; bankAccountId: string }): Promise<ApiResponse<Subscription>> {
        return apiFetch('/wallet/subscriptions', { method: 'POST', body: payload })
      },
      async getSubscription(id: string): Promise<ApiResponse<Subscription>> {
        return apiFetch(`/wallet/subscriptions/${id}`, { method: 'GET' })
      },
      async updateSubscription(id: string, payload: { name?: string; status?: 'INCOME' | 'EXPENSE'; amount?: number; category?: string; paymentMethod?: string; isPaid?: boolean; startDate?: string; endDate?: string }): Promise<ApiResponse<Subscription>> {
        return apiFetch(`/wallet/subscriptions/${id}`, { method: 'PUT', body: payload })
      },
      async deleteSubscription(id: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch(`/wallet/subscriptions/${id}`, { method: 'DELETE' })
      },

      // Transactions
      async listTransactions(bankAccountId: string): Promise<ApiResponse<Transaction[]>> {
        return apiFetch('/wallet/transactions', { method: 'GET', query: { bankAccountId } })
      },
      async createTransaction(payload: { status: 'INCOME' | 'EXPENSE'; amount: number; category: string; description?: string; date?: string; bankAccountId: string }): Promise<ApiResponse<Transaction>> {
        return apiFetch('/wallet/transactions', { method: 'POST', body: payload })
      },
      async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
        return apiFetch(`/wallet/transactions/${id}`, { method: 'GET' })
      },
      async updateTransaction(id: string, payload: { status?: 'INCOME' | 'EXPENSE'; amount?: number; category?: string; description?: string; date?: string }): Promise<ApiResponse<Transaction>> {
        return apiFetch(`/wallet/transactions/${id}`, { method: 'PUT', body: payload })
      },
      async deleteTransaction(id: string): Promise<ApiResponse<{ message: string }>> {
        return apiFetch(`/wallet/transactions/${id}`, { method: 'DELETE' })
      },

      // Budget
      async listBudgets(): Promise<ApiResponse<Budget[]>> {
        return apiFetch('/wallet/budget', { method: 'GET' })
      },
      async getBudget(month: number, year: number): Promise<ApiResponse<Budget>> {
        return apiFetch('/wallet/budget/month', { method: 'GET', query: { month, year } })
      },
      async setBudget(payload: { amount: number; month: number; year: number }): Promise<ApiResponse<Budget>> {
        return apiFetch('/wallet/budget', { method: 'POST', body: payload })
      },
      async deleteBudget(month: number, year: number): Promise<ApiResponse<{ message: string }>> {
        return apiFetch('/wallet/budget/month', { method: 'DELETE', query: { month, year } })
      },
      async getMonthlyChart(months?: number): Promise<ApiResponse<MonthlyChartResponse>> {
        return apiFetch('/wallet/budget/chart', { method: 'GET', query: { months } })
      }
    },

    // ─── Time Management ──────────────────────────────────────────────────────
    timeManagement: {
      templates: {
        async list(): Promise<ApiResponse<import('~/types').DailyTemplate[]>> {
          return apiFetch('/time-management/daily-template', { method: 'GET' })
        },
        async create(payload: { name: string; description?: string; isActive?: boolean }): Promise<ApiResponse<import('~/types').DailyTemplate>> {
          return apiFetch('/time-management/daily-template', { method: 'POST', body: payload })
        },
        async get(id: string): Promise<ApiResponse<import('~/types').DailyTemplate>> {
          return apiFetch(`/time-management/daily-template/${id}`, { method: 'GET' })
        },
        async update(id: string, payload: { name?: string; description?: string; isActive?: boolean }): Promise<ApiResponse<import('~/types').DailyTemplate>> {
          return apiFetch(`/time-management/daily-template/${id}`, { method: 'PUT', body: payload })
        },
        async delete(id: string): Promise<ApiResponse<{ message: string }>> {
          return apiFetch(`/time-management/daily-template/${id}`, { method: 'DELETE' })
        },
      },

      schedules: {
        async list(): Promise<ApiResponse<import('~/types').DailySchedule[]>> {
          return apiFetch('/time-management/daily-schedule', { method: 'GET' })
        },
        async create(payload: { date: string; templateId?: string }): Promise<ApiResponse<import('~/types').DailySchedule>> {
          return apiFetch('/time-management/daily-schedule', { method: 'POST', body: payload })
        },
        async get(id: string): Promise<ApiResponse<import('~/types').DailySchedule>> {
          return apiFetch(`/time-management/daily-schedule/${id}`, { method: 'GET' })
        },
        async update(id: string, payload: { date?: string; templateId?: string | null }): Promise<ApiResponse<import('~/types').DailySchedule>> {
          return apiFetch(`/time-management/daily-schedule/${id}`, { method: 'PUT', body: payload })
        },
        async delete(id: string): Promise<ApiResponse<{ message: string }>> {
          return apiFetch(`/time-management/daily-schedule/${id}`, { method: 'DELETE' })
        },
      },

      blocks: {
        async list(): Promise<ApiResponse<import('~/types').TimeBlock[]>> {
          return apiFetch('/time-management/time-block', { method: 'GET' })
        },
        async create(payload: {
          title: string
          description?: string
          startTime: string
          endTime: string
          duration: number
          category: import('~/types').TimeCategory
          priority?: import('~/types').TimePriority
          position?: number
          repeatType?: import('~/types').RepeatType
          repeatDays?: string
          repeatEnd?: string
          templateId?: string
          scheduleId?: string
        }): Promise<ApiResponse<import('~/types').TimeBlock>> {
          return apiFetch('/time-management/time-block', { method: 'POST', body: payload })
        },
        async get(id: string): Promise<ApiResponse<import('~/types').TimeBlock>> {
          return apiFetch(`/time-management/time-block/${id}`, { method: 'GET' })
        },
        async update(id: string, payload: Partial<{
          title: string
          description: string
          startTime: string
          endTime: string
          duration: number
          category: import('~/types').TimeCategory
          priority: import('~/types').TimePriority
          position: number
          isCompleted: boolean
          isLocked: boolean
          repeatType: import('~/types').RepeatType
          repeatDays: string
          repeatEnd: string | null
        }>): Promise<ApiResponse<import('~/types').TimeBlock>> {
          return apiFetch(`/time-management/time-block/${id}`, { method: 'PUT', body: payload })
        },
        async delete(id: string): Promise<ApiResponse<{ message: string }>> {
          return apiFetch(`/time-management/time-block/${id}`, { method: 'DELETE' })
        },
      },
    },
  }
}
