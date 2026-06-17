import { defineStore } from 'pinia'
import type { Project, ProjectDetail, KanbanCard, KanbanColumn, CardLabel, Subtask } from '~/types'

export const useProjectsStore = defineStore('projects', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const projects = ref<Project[]>([])
  const currentProject = ref<ProjectDetail | null>(null)
  const isLoading = ref(false)
  const unreadNotificationCount = ref(0)

  // ─── Getters ──────────────────────────────────────────────────────────────
  const activeProjects = computed(() => projects.value.filter(p => !p.isArchived))
  const archivedProjects = computed(() => projects.value.filter(p => p.isArchived))

  const currentColumns = computed(() => currentProject.value?.columns ?? [])

  // ─── Project Actions ──────────────────────────────────────────────────────
  function setProjects(list: Project[]) {
    projects.value = list
  }

  function setCurrentProject(project: ProjectDetail | null) {
    currentProject.value = project
  }

  function upsertProject(project: Project) {
    const idx = projects.value.findIndex(p => p.id === project.id)
    if (idx >= 0) {
      projects.value[idx] = project
    } else {
      projects.value.unshift(project)
    }
    // Keep current project in sync
    if (currentProject.value?.id === project.id) {
      currentProject.value = { ...currentProject.value, ...project }
    }
  }

  function removeProject(projectId: string) {
    projects.value = projects.value.filter(p => p.id !== projectId)
    if (currentProject.value?.id === projectId) {
      currentProject.value = null
    }
  }

  // ─── Column Actions ────────────────────────────────────────────────────────
  function addColumn(column: KanbanColumn) {
    if (!currentProject.value) return
    currentProject.value.columns.push({ ...column, cards: [] })
  }

  function updateColumn(columnId: string, updates: Partial<KanbanColumn>) {
    if (!currentProject.value) return
    const col = currentProject.value.columns.find(c => c.id === columnId)
    if (col) Object.assign(col, updates)
  }

  function removeColumn(columnId: string) {
    if (!currentProject.value) return
    currentProject.value.columns = currentProject.value.columns.filter(c => c.id !== columnId)
  }

  function setColumns(columns: KanbanColumn[]) {
    if (!currentProject.value) return
    currentProject.value.columns = columns
  }

  // ─── Card Actions ─────────────────────────────────────────────────────────
  function addCard(card: KanbanCard) {
    if (!currentProject.value) return
    const col = currentProject.value.columns.find(c => c.id === card.columnId)
    if (col) col.cards.push(card)
  }

  function updateCard(cardId: string, updates: Partial<KanbanCard>) {
    if (!currentProject.value) return
    for (const col of currentProject.value.columns) {
      const card = col.cards.find(c => c.id === cardId)
      if (card) {
        Object.assign(card, updates)
        return
      }
    }
  }

  function removeCard(cardId: string) {
    if (!currentProject.value) return
    for (const col of currentProject.value.columns) {
      const idx = col.cards.findIndex(c => c.id === cardId)
      if (idx >= 0) {
        col.cards.splice(idx, 1)
        return
      }
    }
  }

  function moveCard(cardId: string, targetColumnId: string, position: number) {
    if (!currentProject.value) return
    let card: KanbanCard | undefined

    // Remove from source column
    for (const col of currentProject.value.columns) {
      const idx = col.cards.findIndex(c => c.id === cardId)
      if (idx >= 0) {
        ;[card] = col.cards.splice(idx, 1)
        break
      }
    }

    if (!card) return

    // Insert into target column at position
    const targetCol = currentProject.value.columns.find(c => c.id === targetColumnId)
    if (targetCol) {
      card.columnId = targetColumnId
      card.position = position
      targetCol.cards.splice(position, 0, card)
    }
  }

  // ─── Subtask Actions ──────────────────────────────────────────────────────
  function addSubtask(cardId: string, subtask: Subtask) {
    if (!currentProject.value) return
    for (const col of currentProject.value.columns) {
      const card = col.cards.find(c => c.id === cardId)
      if (card) {
        if (!card.subtasks) card.subtasks = []
        card.subtasks.push(subtask)
        return
      }
    }
  }

  function updateSubtask(cardId: string, subtaskId: string, updates: Partial<Subtask>) {
    if (!currentProject.value) return
    for (const col of currentProject.value.columns) {
      const card = col.cards.find(c => c.id === cardId)
      if (card?.subtasks) {
        const subtask = card.subtasks.find(s => s.id === subtaskId)
        if (subtask) Object.assign(subtask, updates)
        return
      }
    }
  }

  function removeSubtask(cardId: string, subtaskId: string) {
    if (!currentProject.value) return
    for (const col of currentProject.value.columns) {
      const card = col.cards.find(c => c.id === cardId)
      if (card?.subtasks) {
        card.subtasks = card.subtasks.filter(s => s.id !== subtaskId)
        return
      }
    }
  }

  // ─── Label Actions ────────────────────────────────────────────────────────
  function addLabel(label: CardLabel) {
    if (!currentProject.value) return
    currentProject.value.labels.push(label)
  }

  function updateLabel(labelId: string, updates: Partial<CardLabel>) {
    if (!currentProject.value) return
    const label = currentProject.value.labels.find(l => l.id === labelId)
    if (label) Object.assign(label, updates)
  }

  function removeLabel(labelId: string) {
    if (!currentProject.value) return
    currentProject.value.labels = currentProject.value.labels.filter(l => l.id !== labelId)
  }

  // ─── Notification Count ───────────────────────────────────────────────────
  function setUnreadCount(count: number) {
    unreadNotificationCount.value = count
  }

  function decrementUnreadCount() {
    if (unreadNotificationCount.value > 0) unreadNotificationCount.value--
  }

  return {
    // State
    projects,
    currentProject,
    isLoading,
    unreadNotificationCount,
    // Getters
    activeProjects,
    archivedProjects,
    currentColumns,
    // Project actions
    setProjects,
    setCurrentProject,
    upsertProject,
    removeProject,
    // Column actions
    addColumn,
    updateColumn,
    removeColumn,
    setColumns,
    // Card actions
    addCard,
    updateCard,
    removeCard,
    moveCard,
    // Subtask actions
    addSubtask,
    updateSubtask,
    removeSubtask,
    // Label actions
    addLabel,
    updateLabel,
    removeLabel,
    // Notification
    setUnreadCount,
    decrementUnreadCount,
  }
})
