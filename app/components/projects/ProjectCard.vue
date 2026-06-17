<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Project, ProjectMember, ProjectProgress } from '~/types'

const props = defineProps<{
  project: Project
}>()

const emit = defineEmits<{
  (e: 'edit', project: Project): void
  (e: 'delete', projectId: string): void
  (e: 'archive', projectId: string): void
}>()

const projectsHelper = useProjects()

const progress = ref<ProjectProgress | null>(null)
const members = ref<ProjectMember[]>([])
const loadingProgress = ref(false)
const showMenu = ref(false)

const fetchCardData = async () => {
  loadingProgress.value = true
  try {
    const [progData, memData] = await Promise.all([
      projectsHelper.fetchProgress(props.project.id),
      useApiService().members.list(props.project.id)
    ])
    progress.value = progData
    members.value = memData.data || []
  } catch (err) {
    console.error('Failed to fetch card details:', err)
  } finally {
    loadingProgress.value = false
  }
}

onMounted(() => {
  fetchCardData()
})

const toggleMenu = (e: Event) => {
  e.stopPropagation()
  showMenu.value = !showMenu.value
}

// Close menu when clicking outside
if (import.meta.client) {
  window.addEventListener('click', () => {
    showMenu.value = false
  })
}

const handleEdit = (e: Event) => {
  e.stopPropagation()
  showMenu.value = false
  emit('edit', props.project)
}

const handleArchive = (e: Event) => {
  e.stopPropagation()
  showMenu.value = false
  emit('archive', props.project.id)
}

const handleDelete = (e: Event) => {
  e.stopPropagation()
  showMenu.value = false
  if (confirm(`Are you sure you want to delete the project "${props.project.name}"? This cannot be undone.`)) {
    emit('delete', props.project.id)
  }
}

const formattedDate = computed(() => {
  if (!props.project.dueDate) return ''
  return new Date(props.project.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
})

const isOverdue = computed(() => {
  if (!props.project.dueDate || props.project.isArchived) return false
  return new Date(props.project.dueDate) < new Date() && progress.value?.progressPercentage !== 100
})
</script>

<template>
  <div 
    class="glass rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer hover:border-white/20 relative flex flex-col justify-between min-h-[200px]"
    @click="navigateTo(`/projects/${project.id}`)"
  >
    <!-- Accent Color Stripe -->
    <div 
      class="absolute top-0 left-0 right-0 h-1 rounded-t-xl" 
      :style="{ backgroundColor: project.colorCode || '#00e5ff' }"
    />

    <!-- Header: Name, Settings Menu -->
    <div class="flex justify-between items-start gap-4">
      <div class="space-y-1">
        <h3 class="font-display font-semibold text-lg text-on-surface line-clamp-1 group-hover:text-primary-container">
          {{ project.name }}
        </h3>
        <p class="text-xs text-on-surface-variant line-clamp-2 min-h-[32px]">
          {{ project.description || 'No description provided.' }}
        </p>
      </div>
      
      <!-- Actions Dropdown -->
      <div class="relative">
        <button 
          @click="toggleMenu"
          class="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
        >
          <Icon name="heroicons:ellipsis-vertical" class="w-5 h-5" />
        </button>

        <div 
          v-if="showMenu"
          class="absolute right-0 mt-1 w-44 rounded-xl border border-white/10 bg-surface-container-high/95 backdrop-blur-xl p-1.5 shadow-2xl z-20"
        >
          <button 
            @click="handleEdit"
            class="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-on-surface hover:bg-white/5 transition-colors"
          >
            <Icon name="heroicons:pencil-square" class="w-4 h-4 text-primary-container" />
            Edit Project
          </button>
          
          <button 
            @click="handleArchive"
            class="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-on-surface hover:bg-white/5 transition-colors"
          >
            <Icon 
              :name="project.isArchived ? 'heroicons:archive-box-arrow-down' : 'heroicons:archive-box'" 
              class="w-4 h-4 text-secondary-container" 
            />
            {{ project.isArchived ? 'Restore Project' : 'Archive Project' }}
          </button>

          <div class="h-[1px] bg-white/5 my-1" />

          <button 
            @click="handleDelete"
            class="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-error hover:bg-error-container/10 transition-colors"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" />
            Delete Project
          </button>
        </div>
      </div>
    </div>

    <!-- Middle/Footer: Progress and Metadata -->
    <div class="mt-6 space-y-4">
      <!-- Progress Bar -->
      <div class="space-y-1.5">
        <div class="flex justify-between text-xs font-mono font-medium">
          <span class="text-on-surface-variant">Progress</span>
          <span class="text-primary-container" v-if="progress">
            {{ Math.round(progress.progressPercentage) }}%
          </span>
          <span class="text-on-surface-variant/40" v-else>Loading...</span>
        </div>
        <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-primary-container to-inverse-primary transition-all duration-500 rounded-full"
            :style="{ width: progress ? `${progress.progressPercentage}%` : '0%' }"
          />
        </div>
      </div>

      <!-- Footer Info -->
      <div class="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
        <!-- Due Date -->
        <div class="flex items-center gap-1.5">
          <Icon 
            name="heroicons:calendar" 
            class="w-4 h-4" 
            :class="isOverdue ? 'text-error' : 'text-on-surface-variant'"
          />
          <span 
            class="text-xs font-mono font-semibold"
            :class="isOverdue ? 'text-error' : 'text-on-surface-variant'"
          >
            {{ formattedDate || 'No due date' }}
          </span>
          <span v-if="project.isArchived" class="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded-md bg-secondary-container/20 text-on-secondary-container">
            ARCHIVED
          </span>
        </div>

        <!-- Avatar Stack -->
        <div class="flex -space-x-2 overflow-hidden">
          <AppAvatar 
            v-for="member in members.slice(0, 4)" 
            :key="member.id"
            :src="member.user?.profilePictureUrl"
            :first-name="member.user?.firstName"
            :last-name="member.user?.lastName"
            size="sm"
            class="ring-2 ring-surface border-0"
            v-tooltip="`${member.user?.firstName} ${member.user?.lastName}`"
          />
          <div 
            v-if="members.length > 4"
            class="relative inline-flex items-center justify-center rounded-full w-8 h-8 text-xs font-mono font-bold ring-2 ring-surface bg-surface-container-high text-on-surface-variant"
          >
            +{{ members.length - 4 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
