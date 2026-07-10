<script setup lang="ts">
import type { TimeBlock } from '~/types'

definePageMeta({ layout: 'default' })

const route = useRoute()
const id = route.params.id as string

const appUrl = useRuntimeConfig().public.appUrl

useSeoMeta({
  title: 'Template Editor – Aligno',
  description: 'Customize and edit hourly schedule blocks, tasks, and habits inside your daily templates in Aligno.',
  ogTitle: 'Template Editor – Aligno',
  ogDescription: 'Customize and edit hourly schedule blocks, tasks, and habits inside your daily templates.',
  ogType: 'website',
  ogUrl: `${appUrl}/time-management/templates/${id}`,
  ogImage: `${appUrl}/og-image.png`,
  ogImageWidth: '1200',
  ogImageHeight: '630',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Template Editor – Aligno',
  twitterDescription: 'Customize and edit hourly schedule blocks, tasks, and habits inside your daily templates.',
  robots: 'noindex, nofollow',
})

useHead({
  link: [{ rel: 'canonical', href: `${appUrl}/time-management/templates/${id}` }],
})

const { currentTemplate, timeBlocks, isLoading, error, fetchTemplate, deleteTimeBlock, toggleBlockComplete, activateTemplateForToday } = useTimeManagement()

const showBlockModal = ref(false)
const editingBlock = ref<TimeBlock | null>(null)
const isActivating = ref(false)

const sortedBlocks = computed(() =>
  [...timeBlocks.value]
    .filter((b) => b.templateId === id)
    .sort((a, b) => {
      const startA = a.startTime.split(':')
      const startB = b.startTime.split(':')
      const ah = Number(startA[0] ?? 0)
      const am = Number(startA[1] ?? 0)
      const bh = Number(startB[0] ?? 0)
      const bm = Number(startB[1] ?? 0)
      return (ah * 60 + am) - (bh * 60 + bm)
    })
)

onMounted(() => fetchTemplate(id))

async function handleActivate() {
  isActivating.value = true
  try {
    await activateTemplateForToday(id)
    navigateTo('/time-management/schedule')
  } finally {
    isActivating.value = false
  }
}

function openEdit(block: TimeBlock) {
  editingBlock.value = block
  showBlockModal.value = true
}

function closeModal() {
  showBlockModal.value = false
  editingBlock.value = null
}

const pendingDeleteBlock = ref<TimeBlock | null>(null)
const isDeletingBlock = ref(false)

const handleRequestDeleteBlock = (block: TimeBlock) => {
  pendingDeleteBlock.value = block
}

const handleConfirmDeleteBlock = async () => {
  if (!pendingDeleteBlock.value) return
  isDeletingBlock.value = true
  try {
    await deleteTimeBlock(pendingDeleteBlock.value.id)
    await fetchTemplate(id)
  } finally {
    isDeletingBlock.value = false
    pendingDeleteBlock.value = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center gap-4">
      <NuxtLink to="/time-management" class="p-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors" aria-label="Back to templates">
        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold font-display text-primary truncate">
          {{ currentTemplate?.name ?? 'Template' }}
        </h1>
        <p v-if="currentTemplate?.description" class="text-sm text-on-surface-variant truncate">{{ currentTemplate.description }}</p>
      </div>
      <span
        v-if="currentTemplate"
        class="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
        :class="currentTemplate.isActive ? 'bg-green-500/15 text-green-400' : 'bg-surface-container text-on-surface-variant'"
      >
        {{ currentTemplate.isActive ? 'Active' : 'Inactive' }}
      </span>
    </div>

    <div v-if="isLoading" class="flex flex-col gap-3">
      <div v-for="i in 4" :key="i" class="glass rounded-xl p-4 h-20 animate-pulse bg-surface-container" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center gap-3 py-16">
      <Icon name="heroicons:exclamation-circle" class="w-12 h-12 text-error" />
      <p class="text-on-surface-variant">{{ error }}</p>
    </div>

    <template v-else>
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          id="add-block-btn"
          @click="showBlockModal = true"
          class="flex items-center gap-2 px-4 py-2.5 bg-surface-container-high rounded-xl text-sm font-medium hover:bg-surface-container text-on-surface transition-colors"
        >
          <Icon name="heroicons:plus" class="w-4 h-4" />
          Add Time Block
        </button>
        <button
          id="activate-template-btn"
          @click="handleActivate"
          :disabled="isActivating"
          class="flex items-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary-container rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Icon name="heroicons:play" class="w-4 h-4" />
          {{ isActivating ? 'Activating...' : 'Activate for Today' }}
        </button>
      </div>

      <div v-if="sortedBlocks.length === 0" class="flex flex-col items-center gap-4 py-16">
        <div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
          <Icon name="heroicons:square-3-stack-3d" class="w-8 h-8 text-on-surface-variant" />
        </div>
        <div class="text-center">
          <p class="font-semibold text-on-surface">No time blocks yet</p>
          <p class="text-sm text-on-surface-variant mt-1">Add blocks to build your daily schedule template.</p>
        </div>
        <button @click="showBlockModal = true" class="px-4 py-2 bg-primary-container text-on-primary-container rounded-xl text-sm font-semibold">Add First Block</button>
      </div>

      <div v-else class="flex flex-col gap-3">
        <TimeTimeBlockCard
          v-for="block in sortedBlocks"
          :key="block.id"
          :block="block"
          @edit="openEdit"
          @delete="handleRequestDeleteBlock"
          @toggle="toggleBlockComplete"
        />
      </div>
    </template>

    <TimeTimeBlockModal
      v-if="showBlockModal"
      :block="editingBlock"
      :template-id="id"
      @close="closeModal"
      @saved="closeModal(); fetchTemplate(id)"
    />

    <AppConfirmModal
      :model-value="!!pendingDeleteBlock"
      title="Delete Time Block"
      message="This time block will be permanently removed from the template."
      :item-name="pendingDeleteBlock ? `${pendingDeleteBlock.startTime} – ${pendingDeleteBlock.endTime}: ${pendingDeleteBlock.title}` : undefined"
      confirm-label="Delete Block"
      :loading="isDeletingBlock"
      @update:model-value="(v) => { if (!v) pendingDeleteBlock = null }"
      @confirm="handleConfirmDeleteBlock"
    />
  </div>
</template>
