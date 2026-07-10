<script setup lang="ts">
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Time Templates – Aligno',
  description: 'Create and manage daily schedule templates in Aligno.',
})

const { templates, isLoading, error, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } = useTimeManagement()

const search = ref('')
const filter = ref<'ALL' | 'ACTIVE'>('ALL')
const showCreateModal = ref(false)
const editingTemplate = ref<import('~/types').DailyTemplate | null>(null)
const deletingId = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const templateToDelete = computed(() =>
  templates.value.find((t) => t.id === deletingId.value)
)

const filteredTemplates = computed(() => {
  let list = templates.value
  if (filter.value === 'ACTIVE') list = list.filter((t) => t.isActive)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((t) => t.name.toLowerCase().includes(q))
  }
  return list
})

onMounted(fetchTemplates)

const onRequestDelete = (id: string) => {
  deletingId.value = id
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingId.value) return
  try {
    await deleteTemplate(deletingId.value)
  } finally {
    deletingId.value = null
    showDeleteConfirm.value = false
  }
}

</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold font-display text-primary">Time Templates</h1>
        <p class="text-on-surface-variant">Design your daily schedule blueprints.</p>
      </div>
      <div class="flex gap-3">
        <NuxtLink
          to="/time-management/schedule"
          class="flex items-center gap-2 px-4 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-semibold border border-white/5 transition-all duration-300"
        >
          <Icon name="heroicons:calendar-days" class="w-5 h-5 text-primary-container" />
          Today's Schedule
        </NuxtLink>
        <button
          id="create-template-btn"
          class="flex items-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary-container rounded-xl font-semibold hover:opacity-90 transition-opacity"
          @click="showCreateModal = true"
        >
          <Icon name="heroicons:plus" class="w-5 h-5" />
          New Template
        </button>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          v-model="search"
          id="template-search"
          type="text"
          placeholder="Search templates..."
          class="w-full pl-9 pr-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container"
        />
      </div>
      <div class="flex gap-2">
        <button
          v-for="f in ['ALL', 'ACTIVE']"
          :key="f"
          :id="`filter-${f.toLowerCase()}`"
          @click="filter = f as 'ALL' | 'ACTIVE'"
          class="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          :class="filter === f ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'"
        >
          {{ f }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="glass rounded-2xl p-5 h-36 animate-pulse bg-surface-container" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center gap-3 py-16">
      <Icon name="heroicons:exclamation-circle" class="w-12 h-12 text-error" />
      <p class="text-on-surface-variant">{{ error }}</p>
      <button @click="fetchTemplates" class="px-4 py-2 bg-primary-container text-on-primary-container rounded-xl text-sm font-medium">Retry</button>
    </div>

    <div v-else-if="filteredTemplates.length === 0" class="flex flex-col items-center gap-4 py-16">
      <div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
        <Icon name="heroicons:clock" class="w-8 h-8 text-on-surface-variant" />
      </div>
      <div class="text-center">
        <p class="font-semibold text-on-surface">No templates found</p>
        <p class="text-sm text-on-surface-variant mt-1">Create your first daily schedule template to get started.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-primary-container text-on-primary-container rounded-xl text-sm font-semibold"
      >Create Template</button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AppCard
        v-for="template in filteredTemplates"
        :key="template.id"
        hover-effect
        class="cursor-pointer"
      >
        <template #header>
          <div class="flex items-start justify-between gap-2">
            <NuxtLink :to="`/time-management/templates/${template.id}`" class="flex-1 min-w-0">
              <h3 class="font-display font-semibold text-on-surface truncate">{{ template.name }}</h3>
            </NuxtLink>
            <div class="flex gap-1 shrink-0">
              <button
                :id="`edit-template-${template.id}`"
                aria-label="Edit template"
                @click.prevent="editingTemplate = template"
                class="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <Icon name="heroicons:pencil-square" class="w-4 h-4" />
              </button>
              <button
                :id="`delete-template-${template.id}`"
                aria-label="Delete template"
                @click.prevent="onRequestDelete(template.id)"
                class="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
                :disabled="deletingId === template.id"
              >
                <Icon name="heroicons:trash" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </template>
        <NuxtLink :to="`/time-management/templates/${template.id}`">
          <p v-if="template.description" class="text-sm text-on-surface-variant line-clamp-2 mb-3">{{ template.description }}</p>
          <div class="flex items-center justify-between">
            <span
              class="text-xs px-2 py-1 rounded-full font-medium"
              :class="template.isActive ? 'bg-green-500/15 text-green-400' : 'bg-surface-container text-on-surface-variant'"
            >
              {{ template.isActive ? 'Active' : 'Inactive' }}
            </span>
            <span class="text-xs text-on-surface-variant">{{ (template._count?.blocks ?? template.timeBlocks?.length ?? 0) }} blocks</span>
          </div>
        </NuxtLink>
      </AppCard>
    </div>

    <TimeCreateTemplateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="showCreateModal = false"
    />

    <TimeEditTemplateModal
      v-if="editingTemplate"
      :template="editingTemplate"
      @close="editingTemplate = null"
      @updated="editingTemplate = null"
    />

    <AppConfirmModal
      v-model="showDeleteConfirm"
      title="Delete Template"
      message="This will permanently remove the template and all its time blocks."
      :item-name="templateToDelete?.name"
      confirm-label="Delete Template"
      @confirm="handleDelete"
      @update:model-value="(v) => { if (!v) { showDeleteConfirm.value = false; deletingId.value = null } }"
    />
  </div>
</template>
