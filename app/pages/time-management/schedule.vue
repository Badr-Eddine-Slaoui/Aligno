<script setup lang="ts">
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: "Today's Schedule – Aligno",
  description: "Your daily time block schedule in Aligno.",
})

const { todaySchedule, timeBlocks, isLoading, error, fetchTodaySchedule, toggleBlockComplete } = useTimeManagement()

const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const todayBlocks = computed(() =>
  [...timeBlocks.value]
    .filter((b) => b.scheduleId === todaySchedule.value?.id)
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

const completedCount = computed(() => todayBlocks.value.filter((b) => b.isCompleted).length)
const progress = computed(() =>
  todayBlocks.value.length > 0 ? Math.round((completedCount.value / todayBlocks.value.length) * 100) : 0
)

const currentMinutes = computed(() => now.value.getHours() * 60 + now.value.getMinutes())

function isCurrentBlock(block: { startTime: string; endTime: string }) {
  const startParts = block.startTime.split(':')
  const endParts = block.endTime.split(':')
  const sh = Number(startParts[0] ?? 0)
  const sm = Number(startParts[1] ?? 0)
  const eh = Number(endParts[0] ?? 0)
  const em = Number(endParts[1] ?? 0)
  return currentMinutes.value >= sh * 60 + sm && currentMinutes.value < eh * 60 + em
}

onMounted(() => {
  fetchTodaySchedule()
  timer = setInterval(() => { now.value = new Date() }, 60000)
})

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold font-display text-primary">Today's Schedule</h1>
        <p class="text-on-surface-variant">{{ todayLabel }}</p>
      </div>
      <NuxtLink
        to="/time-management"
        class="flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface rounded-xl text-sm font-medium hover:bg-surface-container-high transition-colors"
      >
        <Icon name="heroicons:squares-plus" class="w-4 h-4" />
        Manage Templates
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="flex flex-col gap-3">
      <div v-for="i in 5" :key="i" class="glass rounded-xl p-4 h-20 animate-pulse bg-surface-container" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center gap-3 py-16">
      <Icon name="heroicons:exclamation-circle" class="w-12 h-12 text-error" />
      <p class="text-on-surface-variant">{{ error }}</p>
      <button @click="fetchTodaySchedule" class="px-4 py-2 bg-primary-container text-on-primary-container rounded-xl text-sm font-medium">Retry</button>
    </div>

    <div v-else-if="!todaySchedule" class="flex flex-col items-center gap-4 py-20">
      <div class="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
        <Icon name="heroicons:calendar-days" class="w-10 h-10 text-on-surface-variant" />
      </div>
      <div class="text-center">
        <p class="font-semibold text-on-surface text-lg">No schedule for today</p>
        <p class="text-sm text-on-surface-variant mt-1 max-w-xs">Activate a template from your templates list to start your day.</p>
      </div>
      <NuxtLink
        to="/time-management"
        class="flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <Icon name="heroicons:clock" class="w-4 h-4" />
        Go to Templates
      </NuxtLink>
    </div>

    <template v-else>
      <div class="glass rounded-2xl p-5">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="font-semibold text-on-surface">{{ todaySchedule.template?.name ?? "Today's Schedule" }}</p>
            <p class="text-sm text-on-surface-variant">{{ completedCount }} / {{ todayBlocks.length }} blocks completed</p>
          </div>
          <span class="text-2xl font-bold font-display text-primary">{{ progress }}%</span>
        </div>
        <div class="w-full h-2 bg-surface-container rounded-full overflow-hidden">
          <div class="h-full bg-primary-container rounded-full transition-all duration-500" :style="{ width: `${progress}%` }" />
        </div>
      </div>

      <div v-if="todayBlocks.length === 0" class="flex flex-col items-center gap-4 py-10">
        <p class="text-on-surface-variant text-sm">This schedule has no time blocks. Add blocks from the template editor.</p>
      </div>

      <div v-else class="flex flex-col gap-3">
        <div
          v-for="block in todayBlocks"
          :key="block.id"
          class="relative"
          :class="{ 'ring-2 ring-primary-container ring-offset-2 ring-offset-surface rounded-xl': isCurrentBlock(block) }"
        >
          <div v-if="isCurrentBlock(block)" class="absolute -top-2.5 right-3 bg-primary-container text-on-primary-container text-xs px-2 py-0.5 rounded-full font-medium">
            Now
          </div>
          <TimeTimeBlockCard
            :block="block"
            @toggle="toggleBlockComplete"
            @edit="() => {}"
            @delete="() => {}"
          />
        </div>
      </div>
    </template>
  </div>
</template>
