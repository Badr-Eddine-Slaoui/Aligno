<script setup lang="ts">
import type { TimeBlock } from '~/types'

const props = defineProps<{ block: TimeBlock }>()
const emit = defineEmits<{ edit: [TimeBlock]; delete: [string]; toggle: [TimeBlock] }>()

const categoryColors: Record<string, string> = {
  WORK: 'bg-blue-500/15 text-blue-400',
  STUDY: 'bg-violet-500/15 text-violet-400',
  HEALTH: 'bg-green-500/15 text-green-400',
  BREAK: 'bg-amber-500/15 text-amber-400',
  PERSONAL: 'bg-pink-500/15 text-pink-400',
  MEETING: 'bg-red-500/15 text-red-400',
  OTHER: 'bg-surface-container text-on-surface-variant',
}

const priorityDot: Record<string, string> = {
  HIGH: 'bg-red-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-green-400',
}
</script>

<template>
  <div
    class="glass rounded-xl p-4 flex items-start gap-4 transition-all duration-200 hover:shadow-lg"
    :class="{ 'opacity-60': block.isCompleted }"
  >
    <button
      :id="`toggle-block-${block.id}`"
      :aria-label="block.isCompleted ? 'Mark incomplete' : 'Mark complete'"
      @click="emit('toggle', block)"
      class="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0"
      :class="block.isCompleted ? 'bg-primary-container border-primary-container' : 'border-outline-variant hover:border-primary-container'"
    >
      <Icon v-if="block.isCompleted" name="heroicons:check" class="w-3 h-3 text-on-primary-container" />
    </button>

    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <p class="font-medium text-on-surface truncate" :class="{ 'line-through text-on-surface-variant': block.isCompleted }">{{ block.title }}</p>
          <p v-if="block.description" class="text-xs text-on-surface-variant mt-0.5 truncate">{{ block.description }}</p>
        </div>
        <div class="flex gap-1 shrink-0">
          <button :id="`edit-block-${block.id}`" aria-label="Edit block" @click="emit('edit', block)" class="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface">
            <Icon name="heroicons:pencil-square" class="w-4 h-4" />
          </button>
          <button :id="`delete-block-${block.id}`" aria-label="Delete block" @click="emit('delete', block.id)" class="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error">
            <Icon name="heroicons:trash" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3 mt-2 flex-wrap">
        <span class="flex items-center gap-1 text-xs text-on-surface-variant">
          <Icon name="heroicons:clock" class="w-3.5 h-3.5" />
          {{ block.startTime }} – {{ block.endTime }}
          <span class="text-on-surface-variant/60">({{ block.duration }}m)</span>
        </span>
        <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="categoryColors[block.category] ?? categoryColors.OTHER">
          {{ block.category }}
        </span>
        <span class="w-2 h-2 rounded-full" :class="priorityDot[block.priority] ?? 'bg-gray-400'" :title="`Priority: ${block.priority}`" />
      </div>
    </div>
  </div>
</template>
