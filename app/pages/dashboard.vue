<script setup lang="ts">
import { useApiService } from '~/services/api'
import type { BankAccount, AppNotification, DailySchedule } from '~/types'

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Dashboard – Aligno',
  description: 'Your Aligno productivity overview — projects, schedule, and finances.',
})

const auth = useAuth()
const api = useApiService()

const projectsCount = ref(0)
const recentProjects = ref<any[]>([])
const totalWalletBalance = ref(0)
const bankAccounts = ref<any[]>([])
const unreadNotifications = ref<any[]>([])
const unreadCount = ref(0)

const todaySchedule = ref<any | null>(null)
const todayBlocks = ref<any[]>([])

const isLoading = ref(true)

async function loadDashboardData() {
  isLoading.value = true
  try {
    const [projRes, walletRes, notifRes, schedRes] = await Promise.all([
      api.projects.list({ limit: 3 }),
      api.wallet.listBankAccounts(),
      api.notifications.list({ limit: 5 }),
      api.timeManagement.schedules.list()
    ])

    // Projects
    projectsCount.value = projRes.data.total
    recentProjects.value = projRes.data.projects

    // Wallet
    bankAccounts.value = walletRes.data
    totalWalletBalance.value = walletRes.data.reduce((sum: number, acc: BankAccount) => sum + acc.balance, 0)

    // Notifications
    unreadNotifications.value = notifRes.data.notifications.filter((n: AppNotification) => !n.isRead)
    unreadCount.value = notifRes.data.unreadCount

    // Today's schedule
    const todayStr = new Date().toISOString().split('T')[0]
    const todaySched = schedRes.data.find((s: DailySchedule) => s.date.startsWith(todayStr)) ?? null
    todaySchedule.value = todaySched
    if (todaySched?.timeBlocks) {
      todayBlocks.value = todaySched.timeBlocks.sort((a: any, b: any) => {
        const startA = a.startTime.split(':')
        const startB = b.startTime.split(':')
        const ah = Number(startA[0] ?? 0)
        const am = Number(startA[1] ?? 0)
        const bh = Number(startB[0] ?? 0)
        const bm = Number(startB[1] ?? 0)
        return (ah * 60 + am) - (bh * 60 + bm)
      })
    }
  } catch (err) {
  } finally {
    isLoading.value = false
  }
}

const completedBlocks = computed(() => todayBlocks.value.filter(b => b.isCompleted).length)

onMounted(loadDashboardData)
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold font-display text-primary">
        Hello, {{ auth.user.value?.firstName ?? 'User' }}
      </h1>
      <p class="text-on-surface-variant">Here is your productivity and lifestyle overview for today.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppCard class="bg-surface-container/50">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-container">
            <Icon name="heroicons:wallet" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Total Balance</p>
            <p class="text-xl font-bold font-display mt-0.5 text-primary">
              ${{ totalWalletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </p>
          </div>
        </div>
      </AppCard>

      <AppCard class="bg-surface-container/50">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-container">
            <Icon name="heroicons:folder" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Active Projects</p>
            <p class="text-xl font-bold font-display mt-0.5 text-primary">{{ projectsCount }}</p>
          </div>
        </div>
      </AppCard>

      <AppCard class="bg-surface-container/50">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-container">
            <Icon name="heroicons:bell" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Notifications</p>
            <p class="text-xl font-bold font-display mt-0.5 text-primary">{{ unreadCount }} unread</p>
          </div>
        </div>
      </AppCard>

      <AppCard class="bg-surface-container/50">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-container">
            <Icon name="heroicons:check-circle" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Today's Tasks</p>
            <p class="text-xl font-bold font-display mt-0.5 text-primary">
              {{ completedBlocks }}/{{ todayBlocks.length }} completed
            </p>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Main Content Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column (Projects & Finance) -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- Recent Projects -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold font-display text-on-surface">Recent Projects</h2>
            <NuxtLink to="/projects" class="text-xs text-primary hover:underline font-semibold">View All</NuxtLink>
          </div>

          <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="i in 2" :key="i" class="glass h-28 rounded-2xl animate-pulse bg-surface-container" />
          </div>
          <div v-else-if="recentProjects.length === 0" class="glass rounded-2xl p-6 text-center text-sm text-on-surface-variant">
            No projects found. Create a project to start planning.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppCard v-for="p in recentProjects" :key="p.id" hover-effect>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-on-surface truncate">{{ p.name }}</h3>
                  <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: p.colorCode }" />
                </div>
              </template>
              <p class="text-xs text-on-surface-variant line-clamp-2 mb-3">
                {{ p.description || 'No description provided.' }}
              </p>
              <NuxtLink :to="`/projects/${p.id}`" class="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                Open Board <Icon name="heroicons:chevron-right" class="w-3 h-3" />
              </NuxtLink>
            </AppCard>
          </div>
        </div>

        <!-- Financial Accounts -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold font-display text-on-surface">Bank Accounts</h2>
            <NuxtLink to="/wallet" class="text-xs text-primary hover:underline font-semibold">Manage Wallet</NuxtLink>
          </div>

          <div v-if="isLoading" class="flex flex-col gap-3">
            <div v-for="i in 2" :key="i" class="glass h-16 rounded-xl animate-pulse bg-surface-container" />
          </div>
          <div v-else-if="bankAccounts.length === 0" class="glass rounded-2xl p-6 text-center text-sm text-on-surface-variant">
            No bank accounts linked yet.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppCard v-for="acc in bankAccounts" :key="acc.id" class="bg-surface-container/30">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-on-surface">{{ acc.name }}</p>
                  <p class="text-xs text-on-surface-variant">{{ acc.bankName || 'Direct Account' }}</p>
                </div>
                <p class="font-bold text-primary">${{ acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
              </div>
            </AppCard>
          </div>
        </div>
      </div>

      <!-- Right Column (Schedule & Notifications) -->
      <div class="flex flex-col gap-6">
        <!-- Today's Schedule -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold font-display text-on-surface">Today's Schedule</h2>
            <NuxtLink to="/time-management/schedule" class="text-xs text-primary hover:underline font-semibold">View Timeline</NuxtLink>
          </div>

          <div v-if="isLoading" class="glass h-48 rounded-2xl animate-pulse bg-surface-container" />
          <div v-else-if="!todaySchedule" class="glass rounded-2xl p-6 text-center">
            <p class="text-sm text-on-surface-variant mb-4">No template active for today.</p>
            <NuxtLink to="/time-management" class="inline-flex px-4 py-2 bg-primary-container text-on-primary-container rounded-xl text-xs font-semibold hover:opacity-90">
              Select Template
            </NuxtLink>
          </div>
          <div v-else-if="todayBlocks.length === 0" class="glass rounded-2xl p-6 text-center text-sm text-on-surface-variant">
            No time blocks in today's active schedule.
          </div>
          <div v-else class="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            <div
              v-for="b in todayBlocks.slice(0, 3)"
              :key="b.id"
              class="glass rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
              :class="{ 'opacity-60': b.isCompleted }"
            >
              <div class="min-w-0">
                <p class="font-semibold text-on-surface truncate" :class="{ 'line-through': b.isCompleted }">{{ b.title }}</p>
                <p class="text-on-surface-variant mt-0.5">{{ b.startTime }} - {{ b.endTime }}</p>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-primary-container/10 text-primary-container text-[10px] uppercase font-bold shrink-0">
                {{ b.category }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex flex-col gap-3">
          <h2 class="text-lg font-bold font-display text-on-surface">Quick Actions</h2>
          <div class="grid grid-cols-2 gap-3">
            <NuxtLink to="/projects" class="glass rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-container-high transition-colors text-center">
              <Icon name="heroicons:folder-plus" class="w-6 h-6 text-primary" />
              <span class="text-xs font-semibold text-on-surface">New Project</span>
            </NuxtLink>
            <NuxtLink to="/time-management" class="glass rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-container-high transition-colors text-center">
              <Icon name="heroicons:clock" class="w-6 h-6 text-primary" />
              <span class="text-xs font-semibold text-on-surface">Manage Time</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
