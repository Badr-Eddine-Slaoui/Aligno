<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Project } from '~/types'

const projectsHelper = useProjects()

// State
const searchQuery = ref('')
const currentTab = ref<'active' | 'archived' | 'all'>('active')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const projectToEdit = ref<Project | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(6)
const totalProjectsCount = ref(0)
const totalPages = ref(1)

const fetchProjectsList = async () => {
  try {
    const isArchived = currentTab.value === 'all' ? undefined : (currentTab.value === 'archived')
    const res = await projectsHelper.fetchProjects({
      page: currentPage.value,
      limit: itemsPerPage.value,
      isArchived
    })
    if (res) {
      totalProjectsCount.value = res.total
      totalPages.value = res.totalPages
    }
  } catch (err) {
    console.error('Failed to fetch projects:', err)
  }
}

onMounted(() => {
  fetchProjectsList()
})

const handleTabChange = (tab: 'active' | 'archived' | 'all') => {
  currentTab.value = tab
  currentPage.value = 1
  fetchProjectsList()
}

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchProjectsList()
  }
}

// Edit handler from ProjectCard
const onEditProject = (project: Project) => {
  projectToEdit.value = project
  showEditModal.value = true
}

// Delete handler
const onDeleteProject = async (projectId: string) => {
  try {
    await projectsHelper.deleteProject(projectId)
    fetchProjectsList()
  } catch (err) {
    console.error('Failed to delete project:', err)
  }
}

// Archive handler
const onArchiveProject = async (projectId: string) => {
  try {
    await projectsHelper.archiveProject(projectId)
    fetchProjectsList()
  } catch (err) {
    console.error('Failed to archive project:', err)
  }
}

// Search and filter in-memory if needed, but since we have api pagination and search, we can filter/search the projects from the store
const filteredProjects = computed(() => {
  const list = projectsHelper.projects.value || []
  if (!searchQuery.value.trim()) return list
  const query = searchQuery.value.toLowerCase()
  return list.filter(p => 
    p.name.toLowerCase().includes(query) || 
    (p.description && p.description.toLowerCase().includes(query))
  )
})
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header Area -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
      <div class="space-y-1">
        <h1 class="font-display font-extrabold text-3xl text-on-surface tracking-tight bg-gradient-to-r from-primary-container to-inverse-primary bg-clip-text text-transparent">
          Projects Workspace
        </h1>
        <p class="text-sm text-on-surface-variant font-body">
          Manage, track progress and collaborate on your team initiatives.
        </p>
      </div>

      <AppButton 
        variant="solid" 
        color="primary" 
        @click="showCreateModal = true"
        class="w-full sm:w-auto"
      >
        <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
        New Project
      </AppButton>
    </div>

    <!-- Filters & Search Bar -->
    <div class="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-surface-container/20 p-4 rounded-2xl border border-white/5">
      <!-- Tabs -->
      <div class="flex p-1 bg-surface-container-low rounded-xl border border-white/5 self-start">
        <button
          v-for="tab in (['active', 'archived', 'all'] as const)"
          :key="tab"
          @click="handleTabChange(tab)"
          class="px-4 py-2 text-xs font-semibold font-display uppercase tracking-wider rounded-lg transition-all duration-300"
          :class="currentTab === tab ? 'bg-primary-container text-on-primary-container glow-primary' : 'text-on-surface-variant hover:text-on-surface'"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/50">
          <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search projects by name or description..."
          class="w-full bg-surface-container-low text-on-surface rounded-xl pl-11 pr-4 py-3 text-sm border border-outline-variant focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all duration-300"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="projectsHelper.isLoading.value" class="flex flex-col justify-center items-center py-24 space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container" />
      <span class="text-sm font-mono text-on-surface-variant">Loading workspace projects...</span>
    </div>

    <!-- Grid / Empty State -->
    <template v-else>
      <div 
        v-if="filteredProjects.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ProjectCard 
          v-for="project in filteredProjects" 
          :key="project.id" 
          :project="project"
          @edit="onEditProject"
          @delete="onDeleteProject"
          @archive="onArchiveProject"
        />
      </div>

      <!-- Empty State -->
      <div 
        v-else 
        class="glass rounded-2xl p-12 text-center max-w-xl mx-auto space-y-6 border border-white/5 my-12"
      >
        <div class="inline-flex p-4 bg-primary-container/10 rounded-2xl border border-primary-container/20 text-primary-container">
          <Icon name="heroicons:folder-open" class="w-12 h-12" />
        </div>
        <div class="space-y-2">
          <h3 class="font-display font-semibold text-lg text-on-surface">No Projects Found</h3>
          <p class="text-sm text-on-surface-variant max-w-md mx-auto">
            {{ searchQuery ? 'No projects match your search query. Try adjusting your keywords.' : 'Get started by creating your first project workspace.' }}
          </p>
        </div>
        <AppButton 
          v-if="!searchQuery"
          variant="solid" 
          color="primary" 
          @click="showCreateModal = true"
        >
          Create First Project
        </AppButton>
      </div>

      <!-- Pagination -->
      <div 
        v-if="totalPages > 1"
        class="flex justify-between items-center pt-8 border-t border-white/5"
      >
        <span class="text-xs font-mono text-on-surface-variant">
          Showing Page {{ currentPage }} of {{ totalPages }}
        </span>

        <div class="flex gap-2">
          <button
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 1"
            class="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="heroicons:chevron-left" class="w-5 h-5" />
          </button>
          
          <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="heroicons:chevron-right" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </template>

    <!-- Modals -->
    <CreateProjectModal 
      v-model="showCreateModal" 
      @created="fetchProjectsList"
    />
    
    <EditProjectModal 
      v-model="showEditModal" 
      :project="projectToEdit"
      @updated="fetchProjectsList"
    />
  </div>
</template>
