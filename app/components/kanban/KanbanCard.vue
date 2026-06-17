<script setup lang="ts">
import { computed } from 'vue'
import type { KanbanCard } from '~/types'

const props = defineProps<{
  card: KanbanCard
}>()

const emit = defineEmits<{
  (e: 'click', card: KanbanCard): void
}>()

const priorityColor = computed(() => {
  switch (props.card.priority) {
    case 'HIGH': return 'error'
    case 'MEDIUM': return 'warning'
    case 'LOW': return 'success'
    default: return 'primary'
  }
})

const subtaskProgress = computed(() => {
  if (!props.card.subtasks || props.card.subtasks.length === 0) return null
  const completed = props.card.subtasks.filter(s => s.isCompleted).length
  const total = props.card.subtasks.length
  return { completed, total }
})

const isOverdue = computed(() => {
  if (!props.card.dueDate) return false
  return new Date(props.card.dueDate) < new Date()
})

const formattedDate = computed(() => {
  if (!props.card.dueDate) return ''
  return new Date(props.card.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
})
</script>

<template>
  <div 
    @click="emit('click', card)"
    class="glass rounded-xl p-4 transition-all duration-300 hover:scale-[1.01] hover:border-white/20 hover:bg-white/5 cursor-grab active:cursor-grabbing select-none border border-white/5 space-y-3 relative group"
  >
    <!-- Priority Bar Accent -->
    <div 
      class="absolute left-0 top-3 bottom-3 w-1 rounded-r-md transition-colors"
      :class="[
        card.priority === 'HIGH' && 'bg-error',
        card.priority === 'MEDIUM' && 'bg-amber-400',
        card.priority === 'LOW' && 'bg-emerald-400'
      ]"
    />

    <!-- Header: Title and priority -->
    <div class="pl-2 space-y-1.5">
      <div class="flex justify-between items-start gap-2">
        <h4 class="font-display font-semibold text-sm text-on-surface line-clamp-2 leading-snug group-hover:text-primary-container">
          {{ card.title }}
        </h4>
      </div>
      
      <!-- Description snippet -->
      <p v-if="card.description" class="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
        {{ card.description }}
      </p>
    </div>

    <!-- Label Pills -->
    <div v-if="card.labels && card.labels.length > 0" class="flex flex-wrap gap-1 pl-2">
      <span 
        v-for="label in card.labels" 
        :key="label.id"
        class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border"
        :style="{
          backgroundColor: `${label.color}15`,
          color: label.color,
          borderColor: `${label.color}30`
        }"
      >
        {{ label.name }}
      </span>
    </div>

    <!-- Footer metadata -->
    <div class="flex items-center justify-between gap-4 pt-2 border-t border-white/5 pl-2">
      <div class="flex items-center gap-3">
        <!-- Due Date -->
        <div 
          v-if="card.dueDate"
          class="flex items-center gap-1 text-[11px] font-mono font-semibold"
          :class="isOverdue ? 'text-error' : 'text-on-surface-variant'"
        >
          <Icon name="heroicons:clock" class="w-3.5 h-3.5" />
          <span>{{ formattedDate }}</span>
        </div>

        <!-- Subtask Progress -->
        <div 
          v-if="subtaskProgress"
          class="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant/80"
        >
          <Icon name="heroicons:check-circle" class="w-3.5 h-3.5 text-emerald-400" />
          <span>{{ subtaskProgress.completed }}/{{ subtaskProgress.total }}</span>
        </div>
      </div>

      <!-- Assignee Avatar -->
      <div v-if="card.assignee">
        <AppAvatar 
          :src="card.assignee.profilePictureUrl"
          :first-name="card.assignee.firstName"
          :last-name="card.assignee.lastName"
          size="sm"
          class="w-6 h-6 border-0"
        />
      </div>
    </div>
  </div>
</template>
