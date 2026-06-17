<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { parseApiError } from '~/utils/errors'
import type { KanbanCard, Subtask } from '~/types'

const props = defineProps<{
  modelValue: boolean
  card: KanbanCard | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated'): void
}>()

const projectsHelper = useProjects()
const auth = useAuth()
const notifications = useNotifications()

// Local copy of card state for editing
const cardDetail = ref<KanbanCard | null>(null)
const isEditingTitle = ref(false)
const titleInput = ref('')
const newSubtaskTitle = ref('')

const project = computed(() => projectsHelper.currentProject.value)

// Check current user's role on project
const currentUserRole = computed(() => {
  if (!project.value || !auth.user.value) return 'VISITOR'
  const member = project.value.members.find(m => m.userId === auth.user.value?.id)
  return member?.role || 'VISITOR'
})

const canModify = computed(() => {
  return currentUserRole.value === 'ADMIN' || currentUserRole.value === 'MEMBER'
})

// Fetch/sync card details when modal is opened or card changes
const syncCardDetails = async () => {
  if (!props.card) return
  try {
    const freshCard = await projectsHelper.fetchCard(props.card.id)
    cardDetail.value = freshCard
    titleInput.value = freshCard.title
  } catch (err) {
    console.error('Failed to fetch card detail:', err)
  }
}

watch(() => props.card, () => {
  if (props.modelValue && props.card) {
    syncCardDetails()
  }
}, { immediate: true })

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.card) {
    syncCardDetails()
  } else {
    cardDetail.value = null
  }
})

// Save card fields helper
const saveCardField = async (fields: Partial<KanbanCard>) => {
  if (!cardDetail.value || !canModify.value) return
  try {
    const updated = await projectsHelper.updateCard(cardDetail.value.id, fields)
    Object.assign(cardDetail.value, updated)
    emit('updated')
  } catch (err) {
    notifications.error('Failed to save changes')
  }
}

// Save title
const saveTitle = () => {
  isEditingTitle.value = false
  const trimmed = titleInput.value.trim()
  if (trimmed && trimmed !== cardDetail.value?.title) {
    saveCardField({ title: trimmed })
  }
}

// Add Subtask
const handleAddSubtask = async () => {
  if (!cardDetail.value) return
  const title = newSubtaskTitle.value.trim()
  if (!title) return
  try {
    await projectsHelper.createSubtask(cardDetail.value.id, title)
    newSubtaskTitle.value = ''
    await syncCardDetails()
    emit('updated')
  } catch (err) {
    notifications.error('Failed to create subtask')
  }
}

// Toggle Subtask
const handleToggleSubtask = async (subtask: Subtask) => {
  if (!cardDetail.value) return
  try {
    await projectsHelper.toggleSubtask(cardDetail.value.id, subtask.id, !subtask.isCompleted)
    await syncCardDetails()
    emit('updated')
  } catch (err) {
    notifications.error('Failed to update subtask')
  }
}

// Delete Subtask
const handleDeleteSubtask = async (subtaskId: string) => {
  if (!cardDetail.value) return
  try {
    await projectsHelper.deleteSubtask(cardDetail.value.id, subtaskId)
    await syncCardDetails()
    emit('updated')
  } catch (err) {
    notifications.error('Failed to delete subtask')
  }
}

// Label Assignments
const handleAssignLabel = async (labelId: string) => {
  if (!cardDetail.value) return
  const currentLabelIds = cardDetail.value.labels?.map(l => l.id) || []
  if (!currentLabelIds.includes(labelId)) {
    const nextLabelIds = [...currentLabelIds, labelId]
    await projectsHelper.assignLabelsToCard(cardDetail.value.id, nextLabelIds)
    await syncCardDetails()
    emit('updated')
  }
}

const handleUnassignLabel = async (labelId: string) => {
  if (!cardDetail.value) return
  const currentLabelIds = cardDetail.value.labels?.map(l => l.id) || []
  const nextLabelIds = currentLabelIds.filter(id => id !== labelId)
  await projectsHelper.assignLabelsToCard(cardDetail.value.id, nextLabelIds)
  await syncCardDetails()
  emit('updated')
}

// Delete Card
const handleDeleteCard = async () => {
  if (!cardDetail.value) return
  if (confirm('Are you sure you want to delete this task? This cannot be undone.')) {
    try {
      await projectsHelper.deleteCard(cardDetail.value.id)
      emit('update:modelValue', false)
      emit('updated')
    } catch (err) {
      notifications.error('Failed to delete task')
    }
  }
}

const assignedLabelIds = computed(() => {
  return cardDetail.value?.labels?.map(l => l.id) || []
})
</script>

<template>
  <AppModal 
    :model-value="modelValue" 
    @update:model-value="emit('update:modelValue', $event)"
    title="Task Details"
  >
    <div v-if="!cardDetail" class="flex flex-col items-center justify-center py-12 space-y-3">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-container" />
      <span class="text-xs font-mono text-on-surface-variant">Loading task details...</span>
    </div>

    <div v-else class="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      <!-- Title Edit Area -->
      <div class="space-y-2">
        <div v-if="isEditingTitle" class="flex gap-2">
          <input 
            v-model="titleInput"
            @blur="saveTitle"
            @keydown.enter="saveTitle"
            class="bg-surface-container-high border border-primary-container/30 text-on-surface rounded-xl px-4 py-2 text-sm font-semibold w-full focus:outline-none focus:ring-1 focus:ring-primary-container"
          />
          <AppButton variant="solid" color="primary" @click="saveTitle">
            Save
          </AppButton>
        </div>
        <h2 
          v-else 
          @click="isEditingTitle = true"
          class="font-display font-bold text-xl text-on-surface hover:text-primary-container cursor-pointer transition-colors"
        >
          {{ cardDetail.title }}
        </h2>
      </div>

      <!-- Settings Grid (Assignee, Due Date, Priority) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-white/2 border border-white/5">
        <!-- Assignee Selection -->
        <div class="flex flex-col gap-1.5">
          <span class="text-[10px] font-mono font-bold tracking-wider uppercase text-on-surface-variant">Assignee</span>
          <select 
            :value="cardDetail.assigneeId || ''"
            @change="saveCardField({ assigneeId: ($event.target as HTMLSelectElement).value || null })"
            :disabled="!canModify"
            class="bg-surface-container text-on-surface rounded-xl px-3 py-2 text-xs border border-outline-variant focus:outline-none"
          >
            <option value="">Unassigned</option>
            <option 
              v-for="member in project?.members || []" 
              :key="member.id"
              :value="member.user?.id"
            >
              {{ member.user?.firstName }} {{ member.user?.lastName }}
            </option>
          </select>
        </div>

        <!-- Priority Selector -->
        <div class="flex flex-col gap-1.5">
          <span class="text-[10px] font-mono font-bold tracking-wider uppercase text-on-surface-variant">Priority</span>
          <select 
            :value="cardDetail.priority"
            @change="saveCardField({ priority: ($event.target as HTMLSelectElement).value as any })"
            :disabled="!canModify"
            class="bg-surface-container text-on-surface rounded-xl px-3 py-2 text-xs border border-outline-variant focus:outline-none"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <!-- Due Date Selection -->
        <div class="flex flex-col gap-1.5">
          <span class="text-[10px] font-mono font-bold tracking-wider uppercase text-on-surface-variant">Due Date</span>
          <input 
            type="date"
            :value="cardDetail.dueDate ? cardDetail.dueDate.substring(0, 10) : ''"
            @change="saveCardField({ dueDate: ($event.target as HTMLInputElement).value || null })"
            :disabled="!canModify"
            class="bg-surface-container text-on-surface rounded-xl px-3 py-2 text-xs border border-outline-variant focus:outline-none"
          />
        </div>
      </div>

      <!-- Description Area -->
      <div class="flex flex-col gap-2">
        <span class="text-[10px] font-mono font-bold tracking-wider uppercase text-on-surface-variant">Description</span>
        <textarea 
          :value="cardDetail.description || ''"
          @blur="saveCardField({ description: ($event.target as HTMLTextAreaElement).value || null })"
          placeholder="Add a detailed description for this task..."
          rows="3"
          :disabled="!canModify"
          class="w-full bg-surface-container-low text-on-surface rounded-xl px-4 py-3 text-xs border border-outline-variant focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all duration-300"
        />
      </div>

      <!-- Labels Manager Section -->
      <div class="flex flex-col gap-2">
        <span class="text-[10px] font-mono font-bold tracking-wider uppercase text-on-surface-variant">Labels & Tags</span>
        <LabelManager 
          :project-id="project?.id || ''"
          :assignedLabelIds="assignedLabelIds"
          @assign="handleAssignLabel"
          @unassign="handleUnassignLabel"
          @labels-updated="syncCardDetails"
        />
      </div>

      <!-- Subtasks Checklist Section -->
      <div class="space-y-3">
        <span class="text-[10px] font-mono font-bold tracking-wider uppercase text-on-surface-variant">Subtasks Checklist</span>
        
        <!-- Checklist items -->
        <div class="space-y-2">
          <div 
            v-for="subtask in cardDetail.subtasks || []" 
            :key="subtask.id"
            class="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all"
          >
            <div class="flex items-center gap-2.5 flex-1 min-w-0">
              <input 
                type="checkbox"
                :checked="subtask.isCompleted"
                @change="handleToggleSubtask(subtask)"
                :disabled="!canModify"
                class="rounded border-outline-variant bg-surface-container text-primary-container focus:ring-primary-container"
              />
              <span 
                class="text-xs transition-colors"
                :class="subtask.isCompleted ? 'line-through text-on-surface-variant/50' : 'text-on-surface'"
              >
                {{ subtask.title }}
              </span>
            </div>

            <button 
              v-if="canModify"
              @click="handleDeleteSubtask(subtask.id)"
              class="p-1 rounded text-error/80 hover:text-error hover:bg-white/5 transition-colors"
            >
              <Icon name="heroicons:trash" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Add Subtask Input -->
        <div v-if="canModify" class="flex gap-2">
          <input 
            v-model="newSubtaskTitle"
            placeholder="Add subtask and press Enter..."
            @keydown.enter="handleAddSubtask"
            class="w-full bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-xs border border-outline-variant focus:outline-none"
          />
          <AppButton variant="ghost" @click="handleAddSubtask" class="py-1 px-3">
            Add
          </AppButton>
        </div>
      </div>

      <!-- Dangerous/Action Footer -->
      <div v-if="canModify" class="flex justify-between items-center pt-6 border-t border-white/5">
        <AppButton 
          variant="solid" 
          color="error" 
          @click="handleDeleteCard"
        >
          <Icon name="heroicons:trash" class="w-4 h-4 mr-1.5" />
          Delete Task
        </AppButton>
        
        <AppButton 
          variant="ghost" 
          @click="emit('update:modelValue', false)"
        >
          Close Detail
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
