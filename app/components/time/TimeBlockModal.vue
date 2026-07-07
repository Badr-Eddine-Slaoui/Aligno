<script setup lang="ts">
import type { TimeBlock, TimeCategory, TimePriority, RepeatType } from '~/types'

const props = defineProps<{ block?: TimeBlock | null; templateId?: string; scheduleId?: string }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const { createTimeBlock, updateTimeBlock } = useTimeManagement()

const isEdit = computed(() => !!props.block)

const form = reactive({
  title: props.block?.title ?? '',
  description: props.block?.description ?? '',
  startTime: props.block?.startTime ?? '09:00',
  endTime: props.block?.endTime ?? '10:00',
  duration: props.block?.duration ?? 60,
  category: (props.block?.category ?? 'WORK') as TimeCategory,
  priority: (props.block?.priority ?? 'MEDIUM') as TimePriority,
  repeatType: (props.block?.repeatType ?? 'NONE') as RepeatType,
})

const categories: TimeCategory[] = ['WORK', 'STUDY', 'HEALTH', 'BREAK', 'PERSONAL', 'MEETING', 'OTHER']
const priorities: TimePriority[] = ['LOW', 'MEDIUM', 'HIGH']

const isSubmitting = ref(false)
const error = ref<string | null>(null)

function calcDuration() {
  const startParts = form.startTime.split(':')
  const endParts = form.endTime.split(':')
  const sh = Number(startParts[0] ?? 0)
  const sm = Number(startParts[1] ?? 0)
  const eh = Number(endParts[0] ?? 0)
  const em = Number(endParts[1] ?? 0)
  const diff = (eh * 60 + em) - (sh * 60 + sm)
  if (diff > 0) form.duration = diff
}

watch(() => [form.startTime, form.endTime], calcDuration)

async function submit() {
  if (!form.title.trim()) return
  isSubmitting.value = true
  error.value = null
  try {
    if (isEdit.value && props.block) {
      await updateTimeBlock(props.block.id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        startTime: form.startTime,
        endTime: form.endTime,
        duration: form.duration,
        category: form.category,
        priority: form.priority,
        repeatType: form.repeatType,
      })
    } else {
      await createTimeBlock({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        startTime: form.startTime,
        endTime: form.endTime,
        duration: form.duration,
        category: form.category,
        priority: form.priority,
        repeatType: form.repeatType,
        templateId: props.templateId,
        scheduleId: props.scheduleId,
      })
    }
    emit('saved')
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? 'Failed to save block'
  } finally {
    isSubmitting.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative glass rounded-2xl p-6 w-full max-w-lg shadow-2xl" role="dialog" aria-modal="true" :aria-labelledby="isEdit ? 'edit-block-title' : 'create-block-title'">
        <div class="flex items-center justify-between mb-5">
          <h2 :id="isEdit ? 'edit-block-title' : 'create-block-title'" class="font-display font-bold text-xl text-on-surface">
            {{ isEdit ? 'Edit Block' : 'New Time Block' }}
          </h2>
          <button aria-label="Close modal" @click="emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="block-title" class="text-sm font-medium text-on-surface">Title <span class="text-error">*</span></label>
            <input id="block-title" v-model="form.title" type="text" placeholder="e.g. Deep Work Session" required class="px-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="block-description" class="text-sm font-medium text-on-surface">Description</label>
            <input id="block-description" v-model="form.description" type="text" class="px-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container" />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="flex flex-col gap-1.5">
              <label for="block-start" class="text-sm font-medium text-on-surface">Start</label>
              <input id="block-start" v-model="form.startTime" type="time" class="px-3 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="block-end" class="text-sm font-medium text-on-surface">End</label>
              <input id="block-end" v-model="form.endTime" type="time" class="px-3 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="block-duration" class="text-sm font-medium text-on-surface">Duration (min)</label>
              <input id="block-duration" v-model.number="form.duration" type="number" min="1" class="px-3 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label for="block-category" class="text-sm font-medium text-on-surface">Category</label>
              <select id="block-category" v-model="form.category" class="px-3 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container">
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="block-priority" class="text-sm font-medium text-on-surface">Priority</label>
              <select id="block-priority" v-model="form.priority" class="px-3 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container">
                <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
          </div>

          <p v-if="error" class="text-sm text-error">{{ error }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="emit('close')" class="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel</button>
            <button type="submit" :disabled="isSubmitting || !form.title.trim()" class="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {{ isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Block' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
