<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { animations } from '@formkit/drag-and-drop'
import type { KanbanColumn, KanbanCard } from '~/types'

const props = defineProps<{
  column: KanbanColumn
}>()

const emit = defineEmits<{
  (e: 'card-click', card: KanbanCard): void
  (e: 'delete-column', columnId: string): void
  (e: 'rename-column', columnId: string, name: string): void
  (e: 'add-card', columnId: string, title: string): void
  (e: 'transfer', data: any): void
  (e: 'sort', data: any): void
}>()

// Inline rename editing state
const isEditingName = ref(false)
const editedName = ref(props.column.name)
const nameInputRef = ref<HTMLInputElement | null>(null)

const startEditing = () => {
  editedName.value = props.column.name
  isEditingName.value = true
  nextTick(() => {
    nameInputRef.value?.focus()
    nameInputRef.value?.select()
  })
}

const saveName = () => {
  if (!isEditingName.value) return
  isEditingName.value = false
  const trimmed = editedName.value.trim()
  if (trimmed && trimmed !== props.column.name) {
    emit('rename-column', props.column.id, trimmed)
  }
}

// Add card quick-input state
const showQuickAdd = ref(false)
const quickAddTitle = ref('')
const quickAddInputRef = ref<HTMLInputElement | null>(null)

const startQuickAdd = () => {
  showQuickAdd.value = true
  nextTick(() => {
    quickAddInputRef.value?.focus()
  })
}

const submitQuickAdd = () => {
  const title = quickAddTitle.value.trim()
  if (title) {
    emit('add-card', props.column.id, title)
    quickAddTitle.value = ''
  }
  showQuickAdd.value = false
}

// Drag and drop state - useDragAndDrop requires a plain array (not a Ref)
const [parent, dndCards] = useDragAndDrop<KanbanCard>([...props.column.cards], {
  group: 'cards',
  plugins: [animations()],
  onTransfer(data: any) {
    emit('transfer', data)
  },
  onSort(data: any) {
    emit('sort', data)
  }
})

// Sync dndCards when prop updates (e.g. store refresh after API response)
watch(() => props.column.cards, (newCards) => {
  dndCards.value = [...newCards]
}, { deep: true })

// Typed computed view for the template
const cards = computed(() => dndCards.value as KanbanCard[])
</script>

<template>
  <div class="flex flex-col bg-surface-container-low/40 border border-white/5 rounded-2xl w-[320px] max-h-[calc(100vh-220px)] flex-shrink-0 relative overflow-hidden backdrop-blur-xl">
    <!-- Column Header -->
    <div class="p-4 flex justify-between items-center border-b border-white/5 bg-white/2 select-none">
      <div class="flex items-center gap-2.5 flex-1 min-w-0">
        <!-- Title input / display -->
        <input 
          v-if="isEditingName"
          ref="nameInputRef"
          v-model="editedName"
          @blur="saveName"
          @keydown.enter="saveName"
          class="bg-surface-container-high border border-primary-container/30 text-on-surface rounded px-2 py-0.5 text-sm font-semibold w-full focus:outline-none focus:ring-1 focus:ring-primary-container"
        />
        <h3 
          v-else 
          @click="startEditing"
          class="font-display font-semibold text-sm text-on-surface truncate cursor-pointer hover:text-primary-container transition-colors"
        >
          {{ column.name }}
        </h3>
        
        <!-- Card Count -->
        <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-white/5 text-on-surface-variant">
          {{ column.cards?.length || 0 }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-1">
        <button 
          @click="startQuickAdd"
          class="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
          title="Add task"
        >
          <Icon name="heroicons:plus" class="w-4 h-4" />
        </button>
        <button 
          v-if="!column.cards || column.cards.length === 0"
          @click="emit('delete-column', column.id)"
          class="p-1 rounded text-error/80 hover:text-error hover:bg-error-container/10 transition-colors"
          title="Delete column"
        >
          <Icon name="heroicons:trash" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Cards Scroll Container -->
    <div 
      ref="parent" 
      :data-column-id="column.id"
      class="p-3 flex flex-col gap-3 overflow-y-auto flex-1 min-h-[150px] transition-colors"
    >
      <KanbanCard 
        v-for="card in cards" 
        :key="card.id" 
        :card="card"
        @click="emit('card-click', card)"
      />
    </div>

    <!-- Quick Add Input Area -->
    <div v-if="showQuickAdd" class="p-3 border-t border-white/5 bg-surface-container/20">
      <input 
        ref="quickAddInputRef"
        v-model="quickAddTitle"
        placeholder="Enter task title..."
        @keydown.enter="submitQuickAdd"
        @blur="submitQuickAdd"
        class="w-full bg-surface-container-high text-on-surface rounded-xl px-3 py-2 text-xs border border-outline-variant focus:outline-none focus:border-primary-container transition-all"
      />
    </div>
    <div v-else class="p-2 border-t border-white/5 flex justify-center">
      <button 
        @click="startQuickAdd"
        class="w-full py-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-xl transition-all flex items-center justify-center gap-1.5"
      >
        <Icon name="heroicons:plus" class="w-3.5 h-3.5" />
        Add Task
      </button>
    </div>
  </div>
</template>
