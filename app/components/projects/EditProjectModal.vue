<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { parseApiError } from '~/utils/errors'
import type { Project } from '~/types'

const props = defineProps<{
  modelValue: boolean
  project: Project | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated'): void
}>()

const projectsHelper = useProjects()
const notifications = useNotifications()

const form = ref({
  name: '',
  description: '',
  dueDate: '',
  colorCode: '#00e5ff'
})

const errors = reactive({
  name: '',
  description: '',
  dueDate: ''
})

const colors = [
  '#00e5ff', // Cyan
  '#3a86c8', // Blue
  '#8338ec', // Purple
  '#ff007f', // Pink
  '#ffb4ab', // Red/Error
  '#06d6a0', // Teal/Green
  '#ffbe0b', // Amber/Yellow
  '#b9c7e4'  // Lavender/Secondary
]

const isLoading = ref(false)

// Watch for changes in the active project prop to populate the form
watch(() => props.project, (newProject) => {
  if (newProject) {
    form.value = {
      name: newProject.name,
      description: newProject.description || '',
      dueDate: newProject.dueDate ? newProject.dueDate.substring(0, 10) : '',
      colorCode: newProject.colorCode || '#00e5ff'
    }
  }
}, { immediate: true })

const onSubmit = async () => {
  if (!props.project) return
  
  errors.name = ''
  if (!form.value.name.trim()) {
    errors.name = 'Project name is required'
    return
  }

  isLoading.value = true
  try {
    await projectsHelper.updateProject(props.project.id, {
      name: form.value.name,
      description: form.value.description || undefined,
      dueDate: form.value.dueDate || null,
      colorCode: form.value.colorCode
    })
    emit('update:modelValue', false)
    emit('updated')
  } catch (err: any) {
    const { message, errors: apiErrors } = parseApiError(err)
    if (apiErrors?.name) {
      errors.name = apiErrors.name[0]
    } else {
      notifications.error(message || 'Failed to update project')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AppModal 
    :model-value="modelValue" 
    @update:model-value="emit('update:modelValue', $event)" 
    title="Edit Project"
  >
    <form @submit.prevent="onSubmit" class="space-y-6">
      <AppInput 
        id="name"
        v-model="form.name"
        label="Project Name"
        placeholder="Enter project name"
        :error="errors.name"
        required
      />

      <div class="flex flex-col gap-2">
        <label class="font-display font-medium text-xs tracking-wider uppercase text-on-surface-variant">
          Description
        </label>
        <textarea 
          v-model="form.description"
          placeholder="Brief details about the project..."
          rows="3"
          class="w-full bg-surface-container-low text-on-surface rounded-xl px-4 py-3 text-sm border border-outline-variant focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all duration-300"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput 
          id="dueDate"
          type="date"
          v-model="form.dueDate"
          label="Due Date"
          :error="errors.dueDate"
        />

        <div class="flex flex-col gap-2">
          <label class="font-display font-medium text-xs tracking-wider uppercase text-on-surface-variant">
            Color Accent
          </label>
          <div class="flex flex-wrap gap-2.5 items-center py-1">
            <button 
              v-for="color in colors" 
              :key="color"
              type="button"
              @click="form.colorCode = color"
              class="w-7 h-7 rounded-full transition-transform duration-200 border-2 relative"
              :class="form.colorCode === color ? 'scale-110 border-white' : 'border-transparent hover:scale-105'"
              :style="{ backgroundColor: color }"
            >
              <span v-if="form.colorCode === color" class="absolute inset-0 flex items-center justify-center text-white text-[10px]">
                ✓
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant">
        <AppButton 
          variant="ghost" 
          type="button" 
          @click="emit('update:modelValue', false)"
        >
          Cancel
        </AppButton>
        <AppButton 
          variant="solid" 
          color="primary" 
          type="submit" 
          :loading="isLoading"
        >
          Save Changes
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
