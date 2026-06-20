<script setup lang="ts">
import type { Subscription } from '~/types'

defineProps<{
  subscriptions: Subscription[]
  currency?: string
}>()

const emit = defineEmits<{
  edit: [sub: Subscription]
  delete: [id: string]
  togglePaid: [sub: Subscription]
}>()

const formatDate = (dateStr: string | Date) =>
  new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
</script>

<template>
  <div class="space-y-6">
    <div v-if="subscriptions.length === 0" class="text-center py-12 text-on-surface-variant text-sm font-body">
      No recurring subscriptions logged. Track your Netflix, Spotify, or regular incomes by clicking "Add Subscription".
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="sub in subscriptions"
        :key="sub.id"
        class="bg-surface-container-low/40 rounded-xl p-6 border border-white/5 flex flex-col justify-between gap-4"
      >
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <h4 class="font-display font-semibold text-base text-on-surface">{{ sub.name }}</h4>
            <div class="flex gap-2">
              <span class="text-xs text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded border border-white/5">
                {{ sub.category }}
              </span>
              <span class="text-xs text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded border border-white/5 font-mono">
                {{ sub.paymentMethod }}
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="emit('edit', sub)" class="text-on-surface-variant hover:text-primary transition-colors p-1">
              <Icon name="heroicons:pencil-square" class="w-4.5 h-4.5" />
            </button>
            <button @click="emit('delete', sub.id)" class="text-on-surface-variant hover:text-error transition-colors p-1">
              <Icon name="heroicons:trash" class="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        <div class="flex justify-between items-end border-t border-white/5 pt-4">
          <div class="flex flex-col gap-0.5 text-xs text-on-surface-variant">
            <span>Start: {{ formatDate(sub.startDate) }}</span>
            <span v-if="sub.endDate">End: {{ formatDate(sub.endDate) }}</span>
          </div>
          <div class="text-right flex flex-col items-end gap-1">
            <span class="font-display font-bold text-lg" :class="sub.status === 'INCOME' ? 'text-emerald-400' : 'text-on-surface'">
              {{ sub.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ currency }}
            </span>
            <button
              @click="emit('togglePaid', sub)"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider select-none transition-all duration-300"
              :class="sub.isPaid
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'"
            >
              <Icon :name="sub.isPaid ? 'heroicons:check-circle' : 'heroicons:clock'" class="w-3.5 h-3.5" />
              {{ sub.isPaid ? 'Paid' : 'Unpaid' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
