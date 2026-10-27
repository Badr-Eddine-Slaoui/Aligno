<script setup lang="ts">
import type { Transaction } from '~/types'

const props = defineProps<{
  transactions: Transaction[]
  currency?: string
}>()

const emit = defineEmits<{
  edit: [tx: Transaction]
  delete: [id: string]
}>()

const formatDate = (dateStr: string | Date) =>
  new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

const searchQuery = ref('')
const categoryFilter = ref('')

const filtered = computed(() => {
  let list = props.transactions
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t => t.description?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
  }
  if (categoryFilter.value) {
    list = list.filter(t => t.category.toLowerCase() === categoryFilter.value.toLowerCase())
  }
  return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const uniqueCategories = computed(() => [...new Set(props.transactions.map(t => t.category))])
</script>

<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="relative w-full sm:max-w-xs">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/50">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search transactions..."
          class="w-full bg-surface-container-low text-on-surface rounded-xl pl-10 pr-4 py-2.5 text-xs border border-outline-variant focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all duration-300"
        />
      </div>
      <select
        v-model="categoryFilter"
        class="bg-surface-container-low text-on-surface rounded-xl px-4 py-2.5 text-xs border border-outline-variant focus:outline-none focus:border-primary-container transition-all duration-300 w-full sm:w-48"
      >
        <option value="">All Categories</option>
        <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <div v-if="filtered.length === 0" class="text-center py-12 text-on-surface-variant text-sm font-body">
      No transactions found. Click "Add Transaction" to log one.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-white/5 text-xs font-mono uppercase tracking-wider text-on-surface-variant/70">
            <th class="pb-3 pr-4">Date</th>
            <th class="pb-3 pr-4">Category</th>
            <th class="pb-3 pr-4">Description</th>
            <th class="pb-3 pr-4">Type</th>
            <th class="pb-3 pr-4 text-right">Amount</th>
            <th class="pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5 text-sm font-body">
          <tr v-for="tx in filtered" :key="tx.id" class="hover:bg-white/[0.02] transition-colors">
            <td class="py-4 pr-4 font-mono text-xs text-on-surface-variant">{{ formatDate(tx.date) }}</td>
            <td class="py-4 pr-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container-high border border-white/5">
                {{ tx.category }}
              </span>
            </td>
            <td class="py-4 pr-4 text-on-surface/90 truncate max-w-[200px]">{{ tx.description || '—' }}</td>
            <td class="py-4 pr-4">
              <AppBadge :color="tx.status === 'INCOME' ? 'success' : 'error'">{{ tx.status }}</AppBadge>
            </td>
            <td class="py-4 pr-4 text-right font-display font-bold" :class="tx.status === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'">
              {{ tx.status === 'INCOME' ? '+' : '-' }}{{ tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ currency }}
            </td>
            <td class="py-4 text-right">
              <div class="flex justify-end gap-3">
                <button @click="emit('edit', tx)" class="text-on-surface-variant hover:text-primary transition-colors">
                  <Icon name="heroicons:pencil-square" class="w-4.5 h-4.5" />
                </button>
                <button @click="emit('delete', tx.id)" class="text-on-surface-variant hover:text-error transition-colors">
                  <Icon name="heroicons:trash" class="w-4.5 h-4.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
