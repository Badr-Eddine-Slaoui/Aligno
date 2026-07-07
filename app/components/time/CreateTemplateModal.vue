<script setup lang="ts">
const emit = defineEmits<{ close: []; created: [] }>()
const { createTemplate } = useTimeManagement()

const form = reactive({ name: '', description: '', isActive: true })
const isSubmitting = ref(false)
const error = ref<string | null>(null)

async function submit() {
  if (!form.name.trim()) return
  isSubmitting.value = true
  error.value = null
  try {
    await createTemplate({ name: form.name.trim(), description: form.description.trim() || undefined, isActive: form.isActive })
    emit('created')
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? 'Failed to create template'
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
      <div class="relative glass rounded-2xl p-6 w-full max-w-md shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="create-template-title">
        <div class="flex items-center justify-between mb-5">
          <h2 id="create-template-title" class="font-display font-bold text-xl text-on-surface">New Template</h2>
          <button aria-label="Close modal" @click="emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="template-name" class="text-sm font-medium text-on-surface">Name <span class="text-error">*</span></label>
            <input
              id="template-name"
              v-model="form.name"
              type="text"
              placeholder="e.g. Morning Routine"
              required
              class="px-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="template-description" class="text-sm font-medium text-on-surface">Description</label>
            <textarea
              id="template-description"
              v-model="form.description"
              rows="3"
              placeholder="Optional description..."
              class="px-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container resize-none"
            />
          </div>

          <label class="flex items-center gap-3 cursor-pointer">
            <input id="template-active" type="checkbox" v-model="form.isActive" class="w-4 h-4 accent-primary-container" />
            <span class="text-sm text-on-surface">Set as active template</span>
          </label>

          <p v-if="error" class="text-sm text-error">{{ error }}</p>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="emit('close')" class="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel</button>
            <button
              type="submit"
              :disabled="isSubmitting || !form.name.trim()"
              class="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {{ isSubmitting ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
