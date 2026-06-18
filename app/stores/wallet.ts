import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BankAccount, Transaction, Subscription, Budget, MonthlyChartItem } from '~/types'

export const useWalletStore = defineStore('wallet', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const bankAccounts = ref<BankAccount[]>([])
  const activeAccountId = ref<string | null>(null)
  const transactions = ref<Transaction[]>([])
  const subscriptions = ref<Subscription[]>([])
  const budgets = ref<Budget[]>([])
  const monthlyChart = ref<MonthlyChartItem[]>([])
  const isLoading = ref(false)

  // ─── Getters ──────────────────────────────────────────────────────────────
  const activeAccount = computed(() => {
    return bankAccounts.value.find(acc => acc.id === activeAccountId.value) || null
  })

  // ─── Actions ──────────────────────────────────────────────────────────────
  function setBankAccounts(accounts: BankAccount[]) {
    bankAccounts.value = accounts
    // Select first account if none selected or if selected account doesn't exist anymore
    if (accounts.length > 0) {
      if (!activeAccountId.value || !accounts.some(acc => acc.id === activeAccountId.value)) {
        activeAccountId.value = accounts[0]!.id
      }
    } else {
      activeAccountId.value = null
    }
  }

  function setActiveAccountId(id: string | null) {
    activeAccountId.value = id
  }

  function setTransactions(list: Transaction[]) {
    transactions.value = list
  }

  function setSubscriptions(list: Subscription[]) {
    subscriptions.value = list
  }

  function setBudgets(list: Budget[]) {
    budgets.value = list
  }

  function setMonthlyChart(chart: MonthlyChartItem[]) {
    monthlyChart.value = chart
  }

  function upsertBankAccount(account: BankAccount) {
    const idx = bankAccounts.value.findIndex(acc => acc.id === account.id)
    if (idx >= 0) {
      bankAccounts.value[idx] = account
    } else {
      bankAccounts.value.push(account)
    }
    if (!activeAccountId.value) {
      activeAccountId.value = account.id
    }
  }

  function removeBankAccount(id: string) {
    bankAccounts.value = bankAccounts.value.filter(acc => acc.id !== id)
    if (activeAccountId.value === id) {
      activeAccountId.value = bankAccounts.value[0]?.id || null
    }
  }

  function upsertTransaction(tx: Transaction) {
    const idx = transactions.value.findIndex(t => t.id === tx.id)
    if (idx >= 0) {
      transactions.value[idx] = tx
    } else {
      transactions.value.unshift(tx)
    }
  }

  function removeTransaction(id: string) {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  function upsertSubscription(sub: Subscription) {
    const idx = subscriptions.value.findIndex(s => s.id === sub.id)
    if (idx >= 0) {
      subscriptions.value[idx] = sub
    } else {
      subscriptions.value.push(sub)
    }
  }

  function removeSubscription(id: string) {
    subscriptions.value = subscriptions.value.filter(s => s.id !== id)
  }

  function upsertBudget(budget: Budget) {
    const idx = budgets.value.findIndex(b => b.month === budget.month && b.year === budget.year)
    if (idx >= 0) {
      budgets.value[idx] = budget
    } else {
      budgets.value.push(budget)
    }
  }

  function removeBudget(month: number, year: number) {
    budgets.value = budgets.value.filter(b => !(b.month === month && b.year === year))
  }

  return {
    // State
    bankAccounts,
    activeAccountId,
    transactions,
    subscriptions,
    budgets,
    monthlyChart,
    isLoading,
    // Getters
    activeAccount,
    // Actions
    setBankAccounts,
    setActiveAccountId,
    setTransactions,
    setSubscriptions,
    setBudgets,
    setMonthlyChart,
    upsertBankAccount,
    removeBankAccount,
    upsertTransaction,
    removeTransaction,
    upsertSubscription,
    removeSubscription,
    upsertBudget,
    removeBudget,
  }
})
