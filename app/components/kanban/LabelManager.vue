<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CardLabel } from '~/types'

const props = defineProps<{
  projectId: string
  assignedLabelIds: string[]
}>()

const emit = defineEmits<{
  (e: 'assign', labelId: string): void
  (e: 'unassign', labelId: string): void
  (e: 'labels-updated'): void
}>()

const projectsHelper = useProjects()
const notifications = useNotifications()

const newLabelName = ref('')
const newLabelColor = ref('#00e5ff')
const editingLabelId = ref<string | null>(null)
const editingName = ref('')
const editingColor = ref('')
const isCreating = ref(false)
const pendingDeleteLabelId = ref<string | null>(null)
const isDeletingLabel = ref(false)

const labelToDelete = computed(() =>
  projectLabels.value.find((l: any) => l.id === pendingDeleteLabelId.value)
)

const colors = [
  '#00e5ff', // Cyan
  '#3a86c8', // Blue
  '#8338ec', // Purple
  '#ff007f', // Pink
  '#ffb4ab', // Red
  '#06d6a0', // Teal/Green
  '#ffbe0b', // Amber/Yellow
  '#b9c7e4'  // Lavender
]

// Current project labels
const projectLabels = computed(() => projectsHelper.currentProject.value?.labels || [])

const handleCreateLabel = async () => {
  const name = newLabelName.value.trim()
  if (!name) {
    notifications.error('Label name is required')
    return
  }
  try {
    await projectsHelper.createLabel(props.projectId, {
      name,
      color: newLabelColor.value
    })
    newLabelName.value = ''
    isCreating.value = false
    emit('labels-updated')
    notifications.success('Label created')
  } catch (err) {
    notifications.error('Failed to create label')
  }
}

const handleStartEdit = (label: CardLabel) => {
  editingLabelId.value = label.id
  editingName.value = label.name
  editingColor.value = label.color
}

const handleUpdateLabel = async () => {
  if (!editingLabelId.value) return
  const name = editingName.value.trim()
  if (!name) {
    notifications.error('Label name is required')
    return
  }
  try {
    await projectsHelper.updateLabel(editingLabelId.value, {
      name,
      color: editingColor.value
    })
    editingLabelId.value = null
    emit('labels-updated')
    notifications.success('Label updated')
  } catch (err) {
    notifications.error('Failed to update label')
  }
}

const handleDeleteLabel = (labelId: string) => {
  pendingDeleteLabelId.value = labelId
}

const confirmDeleteLabel = async () => {
  if (!pendingDeleteLabelId.value) return
  isDeletingLabel.value = true
  try {
    await projectsHelper.deleteLabel(pendingDeleteLabelId.value)
    emit('labels-updated')
    notifications.success('Label deleted')
  } catch (err) {
    notifications.error('Failed to delete label')
  } finally {
    isDeletingLabel.value = false
    pendingDeleteLabelId.value = null
  }
}

const toggleAssign = (labelId: string) => {
  if (props.assignedLabelIds.includes(labelId)) {
    emit('unassign', labelId)
  } else {
    emit('assign', labelId)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Existing Labels Checkbox List -->
    <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
      <div 
        v-for="label in projectLabels" 
        :key="label.id"
        class="flex items-center justify-between gap-3 p-2 rounded-xl bg-surface-container-low border border-white/5 hover:bg-white/2 transition-all"
      >
        <div class="flex items-center gap-2.5 flex-1 min-w-0">
          <input 
            type="checkbox" 
            :checked="assignedLabelIds.includes(label.id)"
            @change="toggleAssign(label.id)"
            class="rounded border-outline-variant bg-surface-container text-primary-container focus:ring-primary-container"
          />
          
          <div v-if="editingLabelId === label.id" class="flex gap-2 items-center flex-1">
            <input 
              v-model="editingName"
              class="bg-surface-container-high border border-outline-variant text-on-surface rounded-lg px-2 py-1 text-xs w-full focus:outline-none"
            />
            <div class="flex gap-1">
              <button 
                v-for="color in colors.slice(0, 4)" 
                :key="color"
                type="button"
                @click="editingColor = color"
                class="w-4 h-4 rounded-full border border-white/20"
                :style="{ backgroundColor: color }"
              />
            </div>
            <button @click="handleUpdateLabel" class="text-xs text-primary-container font-semibold">
              Save
            </button>
            <button @click="editingLabelId = null" class="text-xs text-on-surface-variant">
              Cancel
            </button>
          </div>

          <span 
            v-else
            class="text-xs font-mono font-bold px-2 py-0.5 rounded-md border truncate"
            :style="{
              backgroundColor: `${label.color}15`,
              color: label.color,
              borderColor: `${label.color}30`
            }"
          >
            {{ label.name }}
          </span>
        </div>

        <div v-if="editingLabelId !== label.id" class="flex items-center gap-1.5">
          <button 
            @click="handleStartEdit(label)"
            class="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
          >
            <Icon name="heroicons:pencil" class="w-3.5 h-3.5" />
          </button>
          <button 
            @click="handleDeleteLabel(label.id)"
            class="p-1 rounded text-error/80 hover:text-error hover:bg-white/5 transition-colors"
          >
            <Icon name="heroicons:trash" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Create New Label Widget -->
    <div class="border-t border-white/5 pt-4">
      <button 
        v-if="!isCreating"
        @click="isCreating = true"
        class="text-xs font-semibold text-primary-container hover:text-primary-container-hover transition-colors flex items-center gap-1.5"
      >
        <Icon name="heroicons:plus" class="w-4 h-4" />
        Create Project Label
      </button>

      <div v-else class="space-y-3 p-3 rounded-xl bg-surface-container-high/40 border border-white/5">
        <input 
          v-model="newLabelName"
          placeholder="Label name (e.g. Frontend)"
          class="w-full bg-surface-container-low text-on-surface rounded-lg px-2.5 py-1.5 text-xs border border-outline-variant focus:outline-none"
        />

        <div class="flex justify-between items-center gap-2">
          <!-- Color Picker -->
          <div class="flex flex-wrap gap-1.5">
            <button 
              v-for="color in colors" 
              :key="color"
              type="button"
              @click="newLabelColor = color"
              class="w-4 h-4 rounded-full transition-transform relative"
              :class="newLabelColor === color ? 'scale-110 ring-1 ring-white' : 'hover:scale-105'"
              :style="{ backgroundColor: color }"
            />
          </div>

          <div class="flex gap-2 text-xs">
            <button @click="isCreating = false" class="text-on-surface-variant py-1">
              Cancel
            </button>
            <button 
              @click="handleCreateLabel"
              class="bg-primary-container text-on-primary-container px-2.5 py-1 rounded-lg font-semibold glow-primary"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <AppConfirmModal
    :model-value="!!pendingDeleteLabelId"
    title="Delete Label"
    message="This label will be permanently removed from this project and all tasks it's assigned to."
    :item-name="labelToDelete?.name"
    confirm-label="Delete Label"
    :loading="isDeletingLabel"
    @update:model-value="(v) => { if (!v) pendingDeleteLabelId = null }"
    @confirm="confirmDeleteLabel"
  />
</template>
