<script setup lang="ts">
import type { MonthlyChartItem } from '~/types'

const props = defineProps<{
  monthlyChart: MonthlyChartItem[]
  currentMonthSpending: number
  currentMonthBudget: number
  currency?: string
}>()

const emit = defineEmits<{
  setBudget: []
  deleteBudget: []
}>()

const budgetProgressPercentage = computed(() => {
  if (props.currentMonthBudget <= 0) return 0
  return Math.min(Math.round((props.currentMonthSpending / props.currentMonthBudget) * 100), 100)
})

const budgetAlert = computed(() => {
  const { currentMonthSpending: spending, currentMonthBudget: budget } = props
  if (budget <= 0) return null
  if (spending >= budget) return { type: 'error', message: `⚠️ Budget limit reached! You have spent ${spending.toLocaleString()} of your ${budget.toLocaleString()} monthly budget.` }
  if (spending >= budget * 0.9) return { type: 'warning', message: `🔔 Warning: 90% of budget used. You have spent ${spending.toLocaleString()} of your ${budget.toLocaleString()} monthly budget.` }
  return { type: 'success', message: `✅ Under budget: You have spent ${spending.toLocaleString()} of your ${budget.toLocaleString()} monthly budget.` }
})

const maxChartValue = computed(() =>
  Math.max(...props.monthlyChart.map(i => Math.max(i.totalSpending, i.budget ?? 0, 1)))
)

const barHeight = (value: number) =>
  `${Math.min(Math.round((value / maxChartValue.value) * 90), 90)}%`
</script>

<template>
  <div class="space-y-8">
    <!-- Monthly tracker + budget card -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      <!-- Spending tracker -->
      <div class="bg-surface-container-low/40 border border-white/5 p-6 rounded-xl flex flex-col justify-between gap-4 md:col-span-2">
        <div class="space-y-2">
          <h3 class="font-display font-semibold text-lg text-on-surface">Monthly Spending Tracker</h3>
          <p class="text-xs text-on-surface-variant">Calculated against expense transactions and regular subscriptions this month.</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-xs font-mono font-semibold uppercase text-on-surface-variant/70">
            <span>Spent: {{ currentMonthSpending.toLocaleString() }} {{ currency }}</span>
            <span>Budget: {{ currentMonthBudget.toLocaleString() }} {{ currency }}</span>
          </div>
          <div class="w-full bg-surface-container-low h-3 rounded-full overflow-hidden border border-white/5">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="currentMonthSpending >= currentMonthBudget ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-primary-container to-inverse-primary'"
              :style="{ width: `${budgetProgressPercentage}%` }"
            />
          </div>
          <div class="text-right text-[10px] font-mono text-on-surface-variant">{{ budgetProgressPercentage }}% of limit used</div>
        </div>

        <div v-if="budgetAlert" class="p-3.5 rounded-lg border text-xs" :class="[
          budgetAlert.type === 'error' && 'bg-error-container/10 border-error-container/30 text-error',
          budgetAlert.type === 'warning' && 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          budgetAlert.type === 'success' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        ]">
          {{ budgetAlert.message }}
        </div>
      </div>

      <!-- Budget action card -->
      <div class="bg-surface-container-low/40 border border-white/5 p-6 rounded-xl flex flex-col justify-between gap-6">
        <div class="space-y-1">
          <span class="text-xs uppercase font-mono tracking-wider text-on-surface-variant/70">Current Month Budget</span>
          <div class="font-display font-extrabold text-2xl text-primary-container">
            {{ currentMonthBudget.toLocaleString() }} {{ currency }}
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <AppButton variant="solid" color="primary" class="w-full text-xs py-2.5" @click="emit('setBudget')">
            <Icon name="heroicons:pencil-square" class="w-4 h-4 mr-2" />
            Update Budget Limit
          </AppButton>
          <AppButton v-if="currentMonthBudget > 0" variant="ghost" class="w-full text-xs py-2.5" @click="emit('deleteBudget')">
            <Icon name="heroicons:trash" class="w-4 h-4 mr-2 text-error" />
            Clear Budget Limit
          </AppButton>
        </div>
      </div>
    </div>

    <!-- 6-month chart -->
    <div class="space-y-4 border-t border-white/5 pt-6">
      <h3 class="font-display font-semibold text-lg text-on-surface">6-Month Spending vs Budget Trend</h3>

      <div v-if="monthlyChart.length === 0" class="text-center py-12 text-on-surface-variant text-sm font-body">
        No historical data available yet.
      </div>

      <div v-else class="bg-surface-container-low/20 rounded-xl p-6 border border-white/5">
        <div class="h-64 flex items-end justify-between gap-4 pt-6 border-b border-white/10 pb-2 relative">
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
            <div class="border-t border-white" /><div class="border-t border-white" />
            <div class="border-t border-white" /><div class="border-t border-white" />
          </div>

          <div
            v-for="item in monthlyChart"
            :key="`${item.year}-${item.month}`"
            class="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end"
          >
            <!-- Tooltip -->
            <div class="absolute bottom-full mb-2 bg-surface-container-highest text-on-surface text-xs rounded px-3 py-2 border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-mono flex flex-col gap-0.5">
              <span class="font-bold text-center border-b border-white/10 pb-0.5 mb-1 font-display">{{ item.month }}/{{ item.year }}</span>
              <span class="text-rose-400">Spent: {{ item.totalSpending.toLocaleString() }}</span>
              <span class="text-primary-container">Budget: {{ item.budget ? item.budget.toLocaleString() : 'N/A' }}</span>
            </div>

            <div class="flex items-end gap-1.5 w-full max-w-[60px] h-48">
              <div
                class="flex-1 rounded-t-sm transition-all duration-500 bg-gradient-to-t"
                :class="item.budget && item.totalSpending >= item.budget ? 'from-rose-600/70 to-red-500' : 'from-primary-container/70 to-inverse-primary'"
                :style="{ height: barHeight(item.totalSpending) }"
              />
              <div
                class="flex-1 rounded-t-sm transition-all duration-500 bg-white/10 border border-white/20"
                :style="{ height: item.budget ? barHeight(item.budget) : '0%' }"
              />
            </div>
            <span class="text-[10px] font-mono text-on-surface-variant font-semibold mt-1">{{ item.month }}/{{ item.year }}</span>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex justify-center gap-6 text-xs font-mono mt-4">
          <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 bg-gradient-to-t from-primary-container to-inverse-primary rounded-sm" />
            <span class="text-on-surface-variant">Spent (Within Limit)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 bg-gradient-to-t from-rose-600 to-red-500 rounded-sm" />
            <span class="text-on-surface-variant">Spent (Limit Exceeded)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 bg-white/10 border border-white/20 rounded-sm" />
            <span class="text-on-surface-variant">Budget Limit</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
