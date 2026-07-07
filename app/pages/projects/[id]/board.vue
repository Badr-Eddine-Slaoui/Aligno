<script setup lang="ts">
useSeoMeta({ title: 'Kanban Board – Aligno', description: 'Drag-and-drop Kanban board for managing project tasks.' })
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { KanbanCard } from '~/types'

const route = useRoute()
const projectId = route.params.id as string

const projectsHelper = useProjects()

// State
const newColumnName = ref('')
const showAddColumnInput = ref(false)
const activeCard = ref<KanbanCard | null>(null)
const showCardDetail = ref(false)

const project = computed(() => projectsHelper.currentProject.value)

const fetchBoardData = async () => {
  try {
    await projectsHelper.fetchProject(projectId)
  } catch (err) {
  }
}

onMounted(() => {
  fetchBoardData()
})

// Add Column
const handleAddColumn = async () => {
  const name = newColumnName.value.trim()
  if (!name) return
  try {
    await projectsHelper.createColumn(projectId, name)
    newColumnName.value = ''
    showAddColumnInput.value = false
  } catch (err) {
  }
}

// Rename Column
const handleRenameColumn = async (columnId: string, name: string) => {
  try {
    await projectsHelper.renameColumn(columnId, name)
  } catch (err) {
  }
}

// Delete Column
const handleDeleteColumn = async (columnId: string) => {
  try {
    await projectsHelper.deleteColumn(columnId)
  } catch (err) {
  }
}

// Add Card
const handleAddCard = async (columnId: string, title: string) => {
  try {
    await projectsHelper.createCard(columnId, { title })
  } catch (err) {
  }
}

// Drag & Drop event handlers
const handleTransfer = async (data: any) => {
  try {
    const targetColumnId = data.targetParent.el.getAttribute('data-column-id')
    const cardId = data.draggedNodes[0].data.value.id
    const position = data.targetIndex
    if (cardId && targetColumnId !== null && position !== undefined) {
      await projectsHelper.moveCard(cardId, targetColumnId, position)
    }
  } catch (err) {
  }
}

const handleSort = async (data: any) => {
  try {
    const columnId = data.parent.el.getAttribute('data-column-id')
    const cardIds = data.values.map((c: any) => c.id)
    if (columnId && cardIds) {
      await projectsHelper.reorderCards(columnId, cardIds)
    }
  } catch (err) {
  }
}

// Card details modal trigger
const openCardDetail = (card: KanbanCard) => {
  activeCard.value = card
  showCardDetail.value = true
}

const handleCardUpdated = () => {
  fetchBoardData()
}
</script>

<template>
  <div class="h-[calc(100vh-100px)] flex flex-col">
    <!-- Board Subheader -->
    <div v-if="project" class="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container/10">
      <div class="flex items-center gap-3">
        <div 
          class="w-3 h-8 rounded-md" 
          :style="{ backgroundColor: project.colorCode || '#00e5ff' }"
        />
        <div>
          <h1 class="font-display font-bold text-2xl text-on-surface">
            {{ project.name }}
          </h1>
          <p class="text-xs text-on-surface-variant font-mono">
            Kanban Board
          </p>
        </div>
      </div>

      <!-- Quick Navigation Tabs -->
      <div class="flex p-1 bg-surface-container-low rounded-xl border border-white/5">
        <NuxtLink 
          :to="`/projects/${projectId}`"
          class="px-4 py-2 text-xs font-semibold font-display uppercase tracking-wider rounded-lg text-on-surface-variant hover:text-on-surface"
        >
          Overview
        </NuxtLink>
        <NuxtLink 
          :to="`/projects/${projectId}/board`"
          class="px-4 py-2 text-xs font-semibold font-display uppercase tracking-wider rounded-lg bg-primary-container text-on-primary-container glow-primary"
        >
          Board
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="projectsHelper.isLoading.value && !project" class="flex flex-col justify-center items-center flex-1 space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container" />
      <span class="text-sm font-mono text-on-surface-variant">Loading project board...</span>
    </div>

    <!-- Board Workspace (Scrollable container) -->
    <div v-else-if="project" class="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-6 items-start">
      <!-- Columns list -->
      <KanbanColumn 
        v-for="column in project.columns" 
        :key="column.id" 
        :column="column"
        @card-click="openCardDetail"
        @rename-column="handleRenameColumn"
        @delete-column="handleDeleteColumn"
        @add-card="handleAddCard"
        @transfer="handleTransfer"
        @sort="handleSort"
      />

      <!-- Add Column Area -->
      <div class="w-[280px] flex-shrink-0">
        <div 
          v-if="showAddColumnInput" 
          class="glass rounded-2xl p-4 border border-white/5 space-y-3"
        >
          <input 
            v-model="newColumnName"
            placeholder="Column name (e.g. In Review)"
            @keydown.enter="handleAddColumn"
            class="w-full bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-sm border border-outline-variant focus:outline-none focus:border-primary-container transition-all"
          />
          <div class="flex justify-end gap-2 text-xs">
            <AppButton variant="text" @click="showAddColumnInput = false">
              Cancel
            </AppButton>
            <AppButton variant="solid" color="primary" @click="handleAddColumn">
              Add
            </AppButton>
          </div>
        </div>
        <button 
          v-else 
          @click="showAddColumnInput = true"
          class="w-full py-3 border border-dashed border-white/10 hover:border-primary-container/30 hover:bg-white/2 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary-container"
        >
          <Icon name="heroicons:plus" class="w-5 h-5" />
          Add Column
        </button>
      </div>
    </div>

    <!-- Card Detail Modal -->
    <CardDetailModal 
      v-model="showCardDetail"
      :card="activeCard"
      @updated="handleCardUpdated"
    />
  </div>
</template>
