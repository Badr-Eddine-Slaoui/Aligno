import { storeToRefs } from 'pinia'
import { useProjectsStore } from '~/stores/projects'
import { useApiService } from '~/services/api'
import { parseApiError } from '~/utils/errors'

export const useProjects = () => {
  const api = useApiService()
  const store = useProjectsStore()
  const notifications = useNotifications()

  const {
    projects,
    currentProject,
    isLoading,
    currentColumns,
    activeProjects,
    archivedProjects,
    unreadNotificationCount
  } = storeToRefs(store)

  // ─── Project CRUD ─────────────────────────────────────────────────────────
  async function fetchProjects(params?: { page?: number; limit?: number; isArchived?: boolean }) {
    store.isLoading = true
    try {
      const res = await api.projects.list(params)
      if (res.success) store.setProjects(res.data.projects)
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function createProject(payload: { name: string; description?: string; dueDate?: string; colorCode?: string }) {
    const res = await api.projects.create(payload)
    if (res.success) {
      store.upsertProject(res.data)
      notifications.success('Project created!')
    }
    return res.data
  }

  async function fetchProject(projectId: string) {
    store.isLoading = true
    try {
      const res = await api.projects.get(projectId)
      if (res.success) store.setCurrentProject(res.data)
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function updateProject(projectId: string, payload: { name?: string; description?: string; dueDate?: string | null; colorCode?: string }) {
    const res = await api.projects.update(projectId, payload)
    if (res.success) {
      store.upsertProject(res.data)
      notifications.success('Project updated!')
    }
    return res.data
  }

  async function deleteProject(projectId: string) {
    await api.projects.delete(projectId)
    store.removeProject(projectId)
    notifications.success('Project deleted')
  }

  async function archiveProject(projectId: string) {
    const res = await api.projects.archive(projectId)
    if (res.success) {
      store.upsertProject(res.data)
      notifications.success(res.data.isArchived ? 'Project archived' : 'Project restored')
    }
    return res.data
  }

  async function fetchProgress(projectId: string) {
    const res = await api.projects.progress(projectId)
    return res.data
  }

  // ─── Columns ──────────────────────────────────────────────────────────────
  async function createColumn(projectId: string, name: string) {
    const res = await api.columns.create(projectId, { name })
    if (res.success) store.addColumn(res.data)
    return res.data
  }

  async function renameColumn(columnId: string, name: string) {
    const res = await api.columns.update(columnId, { name })
    if (res.success) store.updateColumn(columnId, { name })
    return res.data
  }

  async function deleteColumn(columnId: string) {
    await api.columns.delete(columnId)
    store.removeColumn(columnId)
  }

  async function reorderColumns(projectId: string, columnIds: string[]) {
    // Optimistic update
    const currentCols = store.currentProject?.columns ?? []
    const reordered = columnIds.map((id, position) => {
      const col = currentCols.find(c => c.id === id)!
      return { ...col, position }
    })
    store.setColumns(reordered)
    await api.columns.reorder(projectId, { columnIds })
  }

  // ─── Cards ────────────────────────────────────────────────────────────────
  async function createCard(columnId: string, payload: { title: string; description?: string; priority?: string }) {
    const res = await api.cards.create(columnId, payload)
    if (res.success) store.addCard(res.data)
    return res.data
  }

  async function fetchCard(cardId: string) {
    const res = await api.cards.get(cardId)
    return res.data
  }

  async function updateCard(cardId: string, payload: { title?: string; description?: string | null; dueDate?: string | null; priority?: string; assigneeId?: string | null }) {
    const res = await api.cards.update(cardId, payload)
    if (res.success) store.updateCard(cardId, res.data)
    return res.data
  }

  async function deleteCard(cardId: string) {
    await api.cards.delete(cardId)
    store.removeCard(cardId)
    notifications.success('Card deleted')
  }

  async function moveCard(cardId: string, targetColumnId: string, position: number) {
    // Optimistic update first
    store.moveCard(cardId, targetColumnId, position)
    try {
      await api.cards.move(cardId, { targetColumnId, position })
    } catch (err) {
      // Revert on failure by re-fetching
      if (store.currentProject) await fetchProject(store.currentProject.id)
      throw err
    }
  }

  async function reorderCards(columnId: string, cardIds: string[]) {
    await api.cards.reorder(columnId, { cardIds })
  }

  async function assignLabelsToCard(cardId: string, labelIds: string[]) {
    const res = await api.cards.assignLabels(cardId, { labelIds })
    if (res.success) store.updateCard(cardId, res.data)
    return res.data
  }

  // ─── Labels ───────────────────────────────────────────────────────────────
  async function createLabel(projectId: string, payload: { name: string; color: string }) {
    const res = await api.labels.create(projectId, payload)
    if (res.success) store.addLabel(res.data)
    return res.data
  }

  async function updateLabel(labelId: string, payload: { name?: string; color?: string }) {
    const res = await api.labels.update(labelId, payload)
    if (res.success) store.updateLabel(labelId, res.data)
    return res.data
  }

  async function deleteLabel(labelId: string) {
    await api.labels.delete(labelId)
    store.removeLabel(labelId)
  }

  // ─── Subtasks ─────────────────────────────────────────────────────────────
  async function createSubtask(cardId: string, title: string) {
    const res = await api.subtasks.create(cardId, { title })
    if (res.success) store.addSubtask(cardId, res.data)
    return res.data
  }

  async function toggleSubtask(cardId: string, subtaskId: string, isCompleted: boolean) {
    store.updateSubtask(cardId, subtaskId, { isCompleted }) // optimistic
    const res = await api.subtasks.update(subtaskId, { isCompleted })
    return res.data
  }

  async function updateSubtaskTitle(cardId: string, subtaskId: string, title: string) {
    const res = await api.subtasks.update(subtaskId, { title })
    if (res.success) store.updateSubtask(cardId, subtaskId, { title })
    return res.data
  }

  async function deleteSubtask(cardId: string, subtaskId: string) {
    await api.subtasks.delete(subtaskId)
    store.removeSubtask(cardId, subtaskId)
  }

  // ─── Members ──────────────────────────────────────────────────────────────
  async function inviteMember(projectId: string, email: string, role: 'MEMBER' | 'VISITOR') {
    const res = await api.members.invite(projectId, { email, role })
    notifications.success(`Invitation sent to ${email}`)
    return res.data
  }

  // ─── Notifications ────────────────────────────────────────────────────────
  async function fetchNotifications(params?: { page?: number; limit?: number }) {
    const res = await api.notifications.list(params)
    if (res.success) store.setUnreadCount(res.data.unreadCount)
    return res.data
  }

  async function markNotificationRead(notificationId: string) {
    await api.notifications.markRead(notificationId)
    store.decrementUnreadCount()
  }

  async function markAllNotificationsRead() {
    await api.notifications.markAllRead()
    store.setUnreadCount(0)
  }

  return {
    // State from store
    projects,
    currentProject,
    isLoading,
    currentColumns,
    activeProjects,
    archivedProjects,
    unreadNotificationCount,
    // Project
    fetchProjects,
    createProject,
    fetchProject,
    updateProject,
    deleteProject,
    archiveProject,
    fetchProgress,
    // Columns
    createColumn,
    renameColumn,
    deleteColumn,
    reorderColumns,
    // Cards
    createCard,
    fetchCard,
    updateCard,
    deleteCard,
    moveCard,
    reorderCards,
    assignLabelsToCard,
    // Labels
    createLabel,
    updateLabel,
    deleteLabel,
    // Subtasks
    createSubtask,
    toggleSubtask,
    updateSubtaskTitle,
    deleteSubtask,
    // Members
    inviteMember,
    // Notifications
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  }
}
