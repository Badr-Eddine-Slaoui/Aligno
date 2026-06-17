<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { parseApiError } from '~/utils/errors'
import type { ProjectMember, ProjectProgress } from '~/types'

const route = useRoute()
const projectId = route.params.id as string

const projectsHelper = useProjects()
const auth = useAuth()
const notifications = useNotifications()

// Invite Member state
const inviteEmail = ref('')
const inviteRole = ref<'MEMBER' | 'VISITOR'>('MEMBER')
const isInviting = ref(false)
const progress = ref<ProjectProgress | null>(null)

const project = computed(() => projectsHelper.currentProject.value)

const fetchDashboardData = async () => {
  try {
    const [_, progData] = await Promise.all([
      projectsHelper.fetchProject(projectId),
      projectsHelper.fetchProgress(projectId)
    ])
    progress.value = progData
  } catch (err) {
    console.error('Failed to load project details:', err)
  }
}

onMounted(() => {
  fetchDashboardData()
})

// Stats calculations
const stats = computed(() => {
  if (!project.value) return { total: 0, completed: 0, inProgress: 0, overdue: 0 }
  
  let total = 0
  let completed = 0
  let inProgress = 0
  let overdue = 0
  const now = new Date()

  project.value.columns.forEach((col, index) => {
    const count = col.cards?.length || 0
    total += count

    // Assume last column is Done/Completed
    if (index === project.value!.columns.length - 1 || col.name.toLowerCase() === 'done') {
      completed += count
    } else if (col.name.toLowerCase() === 'in progress') {
      inProgress += count
    } else {
      inProgress += count // default all other non-done to in progress / other
    }

    // Check overdue on active cards
    if (index < project.value!.columns.length - 1 && col.name.toLowerCase() !== 'done') {
      col.cards?.forEach(card => {
        if (card.dueDate && new Date(card.dueDate) < now) {
          overdue++
        }
      })
    }
  })

  return { total, completed, inProgress, overdue }
})

// Invite Member
const handleInviteMember = async () => {
  const email = inviteEmail.value.trim()
  if (!email) return
  isInviting.value = true
  try {
    await projectsHelper.inviteMember(projectId, email, inviteRole.value)
    inviteEmail.value = ''
    // Reload members list
    await projectsHelper.fetchProject(projectId)
  } catch (err) {
    const { message } = parseApiError(err)
    notifications.error(message || 'Failed to send invitation')
  } finally {
    isInviting.value = false
  }
}

const formattedDueDate = computed(() => {
  if (!project.value?.dueDate) return ''
  return new Date(project.value.dueDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Board Subheader -->
    <div v-if="project" class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
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
            Project Workspace Overview
          </p>
        </div>
      </div>

      <!-- Quick Navigation Tabs -->
      <div class="flex p-1 bg-surface-container-low rounded-xl border border-white/5">
        <NuxtLink 
          :to="`/projects/${projectId}`"
          class="px-4 py-2 text-xs font-semibold font-display uppercase tracking-wider rounded-lg bg-primary-container text-on-primary-container glow-primary"
        >
          Overview
        </NuxtLink>
        <NuxtLink 
          :to="`/projects/${projectId}/board`"
          class="px-4 py-2 text-xs font-semibold font-display uppercase tracking-wider rounded-lg text-on-surface-variant hover:text-on-surface"
        >
          Board
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="projectsHelper.isLoading.value && !project" class="flex flex-col justify-center items-center py-24 space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container" />
      <span class="text-sm font-mono text-on-surface-variant">Loading project summary...</span>
    </div>

    <div v-else-if="project" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Overview Panel -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Project Description & Metadata Card -->
        <AppCard>
          <template #header>
            <h3 class="font-display font-bold text-lg text-on-surface">Project Details</h3>
          </template>

          <div class="space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">Description</span>
              <p class="text-sm text-on-surface-variant leading-relaxed">
                {{ project.description || 'No description provided for this project.' }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div class="space-y-1">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">Due Date</span>
                <p class="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                  <Icon name="heroicons:calendar" class="w-4 h-4 text-primary-container" />
                  {{ formattedDueDate || 'No target date set' }}
                </p>
              </div>

              <div class="space-y-1">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">Status</span>
                <p class="text-sm">
                  <span 
                    v-if="project.isArchived"
                    class="px-2.5 py-1 text-xs font-mono font-bold tracking-wider rounded-lg bg-secondary-container/20 text-on-secondary-container border border-secondary-container/20"
                  >
                    ARCHIVED
                  </span>
                  <span 
                    v-else
                    class="px-2.5 py-1 text-xs font-mono font-bold tracking-wider rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >
                    ACTIVE
                  </span>
                </p>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Task Stats Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <!-- Total Card -->
          <div class="glass rounded-xl p-4 border border-white/5 space-y-1">
            <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">Total Tasks</span>
            <p class="text-2xl font-display font-extrabold text-on-surface">{{ stats.total }}</p>
          </div>

          <!-- Completed Card -->
          <div class="glass rounded-xl p-4 border border-white/5 space-y-1">
            <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400">Completed</span>
            <p class="text-2xl font-display font-extrabold text-emerald-400">{{ stats.completed }}</p>
          </div>

          <!-- In Progress Card -->
          <div class="glass rounded-xl p-4 border border-white/5 space-y-1">
            <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400">In Progress</span>
            <p class="text-2xl font-display font-extrabold text-amber-400">{{ stats.inProgress }}</p>
          </div>

          <!-- Overdue Card -->
          <div class="glass rounded-xl p-4 border border-white/5 space-y-1">
            <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-error">Overdue</span>
            <p class="text-2xl font-display font-extrabold text-error">{{ stats.overdue }}</p>
          </div>
        </div>

        <!-- Navigation Shortcut Card -->
        <div class="glass rounded-2xl p-6 border border-white/5 flex justify-between items-center bg-gradient-to-r from-primary-container/10 via-transparent to-transparent">
          <div class="space-y-1">
            <h4 class="font-display font-bold text-base text-on-surface">Collaborative Workspace</h4>
            <p class="text-xs text-on-surface-variant">View tasks, columns, and drag items inside the active board.</p>
          </div>
          <AppButton 
            variant="solid" 
            color="primary"
            @click="navigateTo(`/projects/${projectId}/board`)"
          >
            Open Board
            <Icon name="heroicons:arrow-right" class="w-4 h-4 ml-1.5" />
          </AppButton>
        </div>
      </div>

      <!-- Right Sidebar: Progress Gauge & Members List -->
      <div class="space-y-8">
        <!-- Progress Circular Gauge Card -->
        <AppCard class="text-center">
          <template #header>
            <h3 class="font-display font-bold text-lg text-on-surface">Overall Progress</h3>
          </template>

          <div class="flex flex-col items-center justify-center space-y-4">
            <!-- Simple Progress Gauge -->
            <div class="relative w-32 h-32 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <!-- Background track -->
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="rgba(255,255,255,0.05)" 
                  stroke-width="8" 
                  fill="transparent" 
                />
                <!-- Active progress -->
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="var(--color-primary-container)" 
                  stroke-width="8" 
                  fill="transparent" 
                  :stroke-dasharray="251.2"
                  :stroke-dashoffset="progress ? 251.2 - (251.2 * progress.progressPercentage) / 100 : 251.2"
                  class="transition-all duration-1000 ease-out"
                />
              </svg>
              <div class="absolute text-xl font-display font-black text-on-surface">
                {{ progress ? Math.round(progress.progressPercentage) : 0 }}%
              </div>
            </div>

            <p class="text-xs text-on-surface-variant font-mono">
              {{ progress?.completedCards || 0 }} of {{ progress?.totalCards || 0 }} tasks finished
            </p>
          </div>
        </AppCard>

        <!-- Members Management -->
        <AppCard>
          <template #header>
            <h3 class="font-display font-bold text-lg text-on-surface">Project Members</h3>
          </template>

          <div class="space-y-6">
            <!-- Invite Widget -->
            <div class="space-y-2">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">Invite new member</span>
              <div class="flex gap-2">
                <input 
                  v-model="inviteEmail"
                  type="email"
                  placeholder="collaborator@example.com"
                  class="w-full bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-xs border border-outline-variant focus:outline-none"
                />
                <select 
                  v-model="inviteRole"
                  class="bg-surface-container text-on-surface rounded-xl px-2 py-2 text-xs border border-outline-variant focus:outline-none"
                >
                  <option value="MEMBER">Member</option>
                  <option value="VISITOR">Visitor</option>
                </select>
                <button 
                  @click="handleInviteMember"
                  :disabled="isInviting"
                  class="bg-primary-container text-on-primary-container p-2 rounded-xl hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  <Icon name="heroicons:paper-airplane" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Members list -->
            <div class="space-y-3">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">Active Members ({{ project.members?.length || 0 }})</span>
              <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
                <div 
                  v-for="member in project.members" 
                  :key="member.id"
                  class="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <AppAvatar 
                      :src="member.user?.profilePictureUrl"
                      :first-name="member.user?.firstName"
                      :last-name="member.user?.lastName"
                      size="sm"
                      class="w-7 h-7 border-0"
                    />
                    <div class="min-w-0">
                      <p class="text-xs font-semibold text-on-surface truncate">
                        {{ member.user?.firstName }} {{ member.user?.lastName }}
                      </p>
                      <p class="text-[10px] font-mono text-on-surface-variant truncate">
                        {{ member.user?.email }}
                      </p>
                    </div>
                  </div>

                  <span class="text-[9px] font-mono font-bold tracking-wider rounded px-1.5 py-0.5"
                    :class="[
                      member.role === 'ADMIN' && 'bg-primary-container/10 text-primary-container border border-primary-container/20',
                      member.role === 'MEMBER' && 'bg-secondary-container/10 text-secondary-container border border-secondary-container/20',
                      member.role === 'VISITOR' && 'bg-white/5 text-on-surface-variant border border-white/10'
                    ]"
                  >
                    {{ member.role }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  </div>
</template>
