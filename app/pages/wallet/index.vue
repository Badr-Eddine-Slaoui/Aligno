<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { BankAccount, Transaction, Subscription, Budget, MonthlyChartItem } from '~/types'

definePageMeta({
  layout: 'default'
})

const wallet = useWallet()

// Selected / Active tab
const activeTab = ref<'transactions' | 'subscriptions' | 'budget'>('transactions')

// Modals State
const showAccountModal = ref(false)
const isEditingAccount = ref(false)
const accountForm = ref({
  id: '',
  name: '',
  bankName: '',
  accountNumber: '',
  balance: 0,
  currency: 'MAD'
})

const showTxModal = ref(false)
const isEditingTx = ref(false)
const txForm = ref({
  id: '',
  status: 'EXPENSE' as 'INCOME' | 'EXPENSE',
  amount: 0,
  category: '',
  description: '',
  date: new Date().toISOString().substring(0, 10),
  bankAccountId: ''
})

const showSubModal = ref(false)
const isEditingSub = ref(false)
const subForm = ref({
  id: '',
  name: '',
  status: 'EXPENSE' as 'INCOME' | 'EXPENSE',
  amount: 0,
  category: '',
  paymentMethod: 'Credit Card',
  isPaid: false,
  startDate: new Date().toISOString().substring(0, 10),
  endDate: '',
  bankAccountId: ''
})

const showBudgetModal = ref(false)
const budgetForm = ref({
  amount: 0,
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
})

// Confirmations
const showDeleteConfirm = ref(false)
const deleteTarget = ref<{ type: 'account' | 'transaction' | 'subscription' | 'budget'; id: string | { month: number; year: number } } | null>(null)

// Filters & Search
const txSearchQuery = ref('')
const txCategoryFilter = ref('')

// Initialize data
onMounted(async () => {
  await wallet.fetchBankAccounts()
  await wallet.fetchMonthlyChart()
  if (wallet.activeAccountId.value) {
    await loadActiveAccountDetails(wallet.activeAccountId.value)
  }
})

// Watch active account changes
watch(wallet.activeAccountId, async (newId) => {
  if (newId) {
    await loadActiveAccountDetails(newId)
  }
})

const loadActiveAccountDetails = async (accountId: string) => {
  await Promise.all([
    wallet.fetchTransactions(accountId),
    wallet.fetchSubscriptions(accountId)
  ])
}

// ─── Computed Properties ───────────────────────────────────────────────────
const netWorth = computed(() => {
  const totals: Record<string, number> = {}
  wallet.bankAccounts.value.forEach(acc => {
    totals[acc.currency] = (totals[acc.currency] || 0) + acc.balance
  })
  return Object.entries(totals).map(([curr, bal]) => {
    return { currency: curr, balance: bal }
  })
})

const filteredTransactions = computed(() => {
  let list = wallet.transactions.value || []
  if (txSearchQuery.value.trim()) {
    const q = txSearchQuery.value.toLowerCase()
    list = list.filter(t => 
      t.description?.toLowerCase().includes(q) || 
      t.category.toLowerCase().includes(q)
    )
  }
  if (txCategoryFilter.value) {
    const cat = txCategoryFilter.value.toLowerCase()
    list = list.filter(t => t.category.toLowerCase() === cat)
  }
  // Sort by date descending
  return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const transactionCategories = computed(() => {
  const cats = new Set<string>()
  wallet.transactions.value.forEach(t => {
    if (t.category) cats.add(t.category)
  })
  return Array.from(cats)
})

// Current month's budget tracking values
const currentMonthSpending = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Find spending entry in monthlyChart
  const currentChartItem = wallet.monthlyChart.value.find(
    item => item.month === currentMonth && item.year === currentYear
  )
  return currentChartItem?.totalSpending || 0
})

const currentMonthBudget = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const currentChartItem = wallet.monthlyChart.value.find(
    item => item.month === currentMonth && item.year === currentYear
  )
  return currentChartItem?.budget || 0
})

const budgetProgressPercentage = computed(() => {
  if (currentMonthBudget.value <= 0) return 0
  return Math.min(Math.round((currentMonthSpending.value / currentMonthBudget.value) * 100), 100)
})

const budgetAlert = computed(() => {
  const spending = currentMonthSpending.value
  const budget = currentMonthBudget.value
  if (budget <= 0) return null
  if (spending >= budget) {
    return {
      type: 'error',
      message: `⚠️ Budget limit reached! You have spent ${spending.toLocaleString()} of your ${budget.toLocaleString()} monthly budget.`
    }
  }
  if (spending >= budget * 0.9) {
    return {
      type: 'warning',
      message: `🔔 Warning: 90% of budget used. You have spent ${spending.toLocaleString()} of your ${budget.toLocaleString()} monthly budget.`
    }
  }
  return {
    type: 'success',
    message: `✅ Under budget: You have spent ${spending.toLocaleString()} of your ${budget.toLocaleString()} monthly budget.`
  }
})

// Helper: Format Date
const formatDate = (dateStr: string | Date) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// ─── Actions / Modals Trigger ────────────────────────────────────────────────
const selectAccount = (id: string) => {
  wallet.setActiveAccountId(id)
}

// Bank Account Modals
const openCreateAccount = () => {
  isEditingAccount.value = false
  accountForm.value = {
    id: '',
    name: '',
    bankName: '',
    accountNumber: '',
    balance: 0,
    currency: 'MAD'
  }
  showAccountModal.value = true
}

const openEditAccount = (acc: BankAccount) => {
  isEditingAccount.value = true
  accountForm.value = {
    id: acc.id,
    name: acc.name,
    bankName: acc.bankName || '',
    accountNumber: acc.accountNumber || '',
    balance: acc.balance,
    currency: acc.currency
  }
  showAccountModal.value = true
}

const submitAccount = async () => {
  try {
    if (isEditingAccount.value) {
      await wallet.updateBankAccount(accountForm.value.id, {
        name: accountForm.value.name,
        bankName: accountForm.value.bankName || undefined,
        accountNumber: accountForm.value.accountNumber || undefined,
        currency: accountForm.value.currency
      })
    } else {
      await wallet.createBankAccount({
        name: accountForm.value.name,
        bankName: accountForm.value.bankName || undefined,
        accountNumber: accountForm.value.accountNumber || undefined,
        balance: Number(accountForm.value.balance),
        currency: accountForm.value.currency
      })
    }
    showAccountModal.value = false
    await wallet.fetchMonthlyChart()
  } catch (err) {}
}

const confirmDeleteAccount = (id: string) => {
  deleteTarget.value = { type: 'account', id }
  showDeleteConfirm.value = true
}

// Transaction Modals
const openCreateTx = () => {
  if (!wallet.activeAccountId.value) return
  isEditingTx.value = false
  txForm.value = {
    id: '',
    status: 'EXPENSE',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().substring(0, 10),
    bankAccountId: wallet.activeAccountId.value
  }
  showTxModal.value = true
}

const openEditTx = (tx: Transaction) => {
  isEditingTx.value = true
  txForm.value = {
    id: tx.id,
    status: tx.status,
    amount: tx.amount,
    category: tx.category,
    description: tx.description || '',
    date: new Date(tx.date).toISOString().substring(0, 10),
    bankAccountId: tx.bankAccountId
  }
  showTxModal.value = true
}

const submitTx = async () => {
  try {
    if (isEditingTx.value) {
      await wallet.updateTransaction(txForm.value.id, {
        status: txForm.value.status,
        amount: Number(txForm.value.amount),
        category: txForm.value.category,
        description: txForm.value.description || undefined,
        date: new Date(txForm.value.date).toISOString()
      })
    } else {
      await wallet.createTransaction({
        status: txForm.value.status,
        amount: Number(txForm.value.amount),
        category: txForm.value.category,
        description: txForm.value.description || undefined,
        date: new Date(txForm.value.date).toISOString(),
        bankAccountId: txForm.value.bankAccountId
      })
    }
    showTxModal.value = false
    await wallet.fetchMonthlyChart()
  } catch (err) {}
}

const confirmDeleteTx = (id: string) => {
  deleteTarget.value = { type: 'transaction', id }
  showDeleteConfirm.value = true
}

// Subscription Modals
const openCreateSub = () => {
  if (!wallet.activeAccountId.value) return
  isEditingSub.value = false
  subForm.value = {
    id: '',
    name: '',
    status: 'EXPENSE',
    amount: 0,
    category: '',
    paymentMethod: 'Credit Card',
    isPaid: false,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: '',
    bankAccountId: wallet.activeAccountId.value
  }
  showSubModal.value = true
}

const openEditSub = (sub: Subscription) => {
  isEditingSub.value = true
  subForm.value = {
    id: sub.id,
    name: sub.name,
    status: sub.status,
    amount: sub.amount,
    category: sub.category,
    paymentMethod: sub.paymentMethod,
    isPaid: sub.isPaid,
    startDate: new Date(sub.startDate).toISOString().substring(0, 10),
    endDate: sub.endDate ? new Date(sub.endDate).toISOString().substring(0, 10) : '',
    bankAccountId: sub.bankAccountId
  }
  showSubModal.value = true
}

const submitSub = async () => {
  try {
    const payload = {
      name: subForm.value.name,
      status: subForm.value.status,
      amount: Number(subForm.value.amount),
      category: subForm.value.category,
      paymentMethod: subForm.value.paymentMethod,
      isPaid: subForm.value.isPaid,
      startDate: new Date(subForm.value.startDate).toISOString(),
      endDate: subForm.value.endDate ? new Date(subForm.value.endDate).toISOString() : undefined
    }

    if (isEditingSub.value) {
      await wallet.updateSubscription(subForm.value.id, payload)
    } else {
      await wallet.createSubscription({
        ...payload,
        bankAccountId: subForm.value.bankAccountId
      })
    }
    showSubModal.value = false
    await wallet.fetchMonthlyChart()
  } catch (err) {}
}

const toggleSubPaid = async (sub: Subscription) => {
  try {
    await wallet.updateSubscription(sub.id, {
      isPaid: !sub.isPaid
    })
    await wallet.fetchMonthlyChart()
  } catch (err) {}
}

const confirmDeleteSub = (id: string) => {
  deleteTarget.value = { type: 'subscription', id }
  showDeleteConfirm.value = true
}

// Budget Modals
const openCreateBudget = () => {
  budgetForm.value = {
    amount: currentMonthBudget.value || 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  }
  showBudgetModal.value = true
}

const submitBudget = async () => {
  try {
    await wallet.setBudget({
      amount: Number(budgetForm.value.amount),
      month: Number(budgetForm.value.month),
      year: Number(budgetForm.value.year)
    })
    showBudgetModal.value = false
    await wallet.fetchMonthlyChart()
  } catch (err) {}
}

const confirmDeleteBudget = () => {
  const now = new Date()
  deleteTarget.value = { 
    type: 'budget', 
    id: '', 
    // Wait, delete target's ID can be details
  }
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  try {
    const target = deleteTarget.value
    if (target.type === 'account') {
      await wallet.deleteBankAccount(target.id as string)
    } else if (target.type === 'transaction') {
      await wallet.deleteTransaction(target.id as string)
    } else if (target.type === 'subscription') {
      await wallet.deleteSubscription(target.id as string)
    } else if (target.type === 'budget') {
      const now = new Date()
      await wallet.deleteBudget(now.getMonth() + 1, now.getFullYear())
    }
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await wallet.fetchMonthlyChart()
  } catch (err) {}
}
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- Loading State -->
    <div v-if="wallet.isLoading.value && wallet.bankAccounts.value.length === 0" class="flex flex-col justify-center items-center py-24 space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container" />
      <span class="text-sm font-mono text-on-surface-variant">Loading financial dashboard...</span>
    </div>

    <!-- Main Workspace Content (Only shown after initial load) -->
    <div v-else class="space-y-8">
      <!-- Header Area -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div class="space-y-1">
          <h1 class="font-display font-extrabold text-3xl text-on-surface tracking-tight bg-gradient-to-r from-primary-container to-inverse-primary bg-clip-text text-transparent">
            Financial Center
          </h1>
          <p class="text-sm text-on-surface-variant font-body">
            Oversee your bank accounts, transactions, budget tracking, and regular subscriptions.
          </p>
        </div>

        <!-- Net Worth / Summary Header card -->
        <div class="flex items-center gap-4 bg-surface-container-low/40 p-4 rounded-xl border border-white/5 select-none self-stretch sm:self-auto justify-between">
          <div class="flex flex-col">
            <span class="text-xs uppercase font-mono tracking-wider text-on-surface-variant/70">Total Assets</span>
            <div class="flex gap-2 items-baseline">
              <template v-if="netWorth.length === 0">
                <span class="font-display font-bold text-lg text-on-surface">0.00 MAD</span>
              </template>
              <template v-else>
                <div class="flex flex-col">
                  <span v-for="net in netWorth" :key="net.currency" class="font-display font-bold text-lg text-primary-container">
                    {{ net.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ net.currency }}
                  </span>
                </div>
              </template>
            </div>
          </div>
          <div class="p-2.5 bg-primary-container/10 rounded-lg text-primary-container">
            <Icon name="heroicons:wallet" class="w-6 h-6" />
          </div>
        </div>
      </div>

    <!-- Accounts Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="font-display font-semibold text-lg text-on-surface">My Accounts</h2>
        <AppButton variant="ghost" class="py-2 px-4 text-xs" @click="openCreateAccount">
          <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
          Add Account
        </AppButton>
      </div>

      <div v-if="wallet.bankAccounts.value.length === 0" class="glass rounded-xl p-12 text-center border border-white/5 max-w-xl mx-auto space-y-6">
        <div class="inline-flex p-4 bg-primary-container/10 rounded-2xl border border-primary-container/20 text-primary-container">
          <Icon name="heroicons:credit-card" class="w-12 h-12 animate-pulse" />
        </div>
        <div class="space-y-2">
          <h3 class="font-display font-semibold text-lg text-on-surface">No Bank Accounts Found</h3>
          <p class="text-sm text-on-surface-variant max-w-sm mx-auto">
            Please register a bank account to start managing assets, tracking transactions, and configuring monthly budgets.
          </p>
        </div>
        <AppButton variant="solid" color="primary" @click="openCreateAccount">
          Create First Account
        </AppButton>
      </div>

      <!-- Bank accounts slider/grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="acc in wallet.bankAccounts.value"
          :key="acc.id"
          @click="selectAccount(acc.id)"
          class="glass rounded-xl p-6 relative flex flex-col justify-between h-48 cursor-pointer transition-all duration-300 border overflow-hidden select-none"
          :class="[
            wallet.activeAccountId.value === acc.id 
              ? 'border-primary-container/80 shadow-[0_0_20px_rgba(0,229,255,0.15)] ring-2 ring-primary-container/10' 
              : 'border-white/5 hover:border-white/20 hover:scale-[1.01]'
          ]"
        >
          <!-- Glowing decorative background spot -->
          <div class="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

          <div class="flex justify-between items-start z-10">
            <div class="flex flex-col">
              <span class="font-display font-bold text-base text-on-surface truncate max-w-[180px]">{{ acc.name }}</span>
              <span class="text-xs text-on-surface-variant font-body mt-0.5">{{ acc.bankName || 'Unknown Bank' }}</span>
            </div>
            
            <!-- Action buttons inside card -->
            <div class="flex gap-2">
              <button 
                @click.stop="openEditAccount(acc)" 
                class="text-on-surface-variant hover:text-primary transition-colors p-1"
                title="Edit Account"
              >
                <Icon name="heroicons:pencil-square" class="w-4 h-4" />
              </button>
              <button 
                @click.stop="confirmDeleteAccount(acc.id)" 
                class="text-on-surface-variant hover:text-error transition-colors p-1"
                title="Delete Account"
              >
                <Icon name="heroicons:trash" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="z-10 flex flex-col mt-4">
            <span class="text-xs uppercase font-mono tracking-widest text-on-surface-variant/60">Balance</span>
            <span class="font-display font-black text-2xl text-primary-container tracking-tight">
              {{ acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} <span class="text-lg text-primary/80 font-bold ml-0.5">{{ acc.currency }}</span>
            </span>
          </div>

          <div class="z-10 flex justify-between items-center mt-2 border-t border-white/5 pt-2">
            <span class="text-xs font-mono text-on-surface-variant/70">{{ acc.accountNumber || '•••• •••• ••••' }}</span>
            <span class="text-[10px] font-mono uppercase bg-primary-container/10 text-primary-container px-2 py-0.5 rounded-full border border-primary-container/20">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Account Details -->
    <div v-if="wallet.activeAccount.value" class="space-y-6">
      
      <!-- Detail Section Header Tabs -->
      <div class="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-surface-container/20 p-4 rounded-xl border border-white/5">
        <!-- Tabs List -->
        <div class="flex p-1 bg-surface-container-low rounded-xl border border-white/5 self-start">
          <button
            @click="activeTab = 'transactions'"
            class="px-4 py-2 text-xs font-semibold font-display uppercase tracking-wider rounded-lg transition-all duration-300"
            :class="activeTab === 'transactions' ? 'bg-primary-container text-on-primary-container glow-primary' : 'text-on-surface-variant hover:text-on-surface'"
          >
            Transactions
          </button>
          <button
            @click="activeTab = 'subscriptions'"
            class="px-4 py-2 text-xs font-semibold font-display uppercase tracking-wider rounded-lg transition-all duration-300"
            :class="activeTab === 'subscriptions' ? 'bg-primary-container text-on-primary-container glow-primary' : 'text-on-surface-variant hover:text-on-surface'"
          >
            Subscriptions
          </button>
          <button
            @click="activeTab = 'budget'"
            class="px-4 py-2 text-xs font-semibold font-display uppercase tracking-wider rounded-lg transition-all duration-300"
            :class="activeTab === 'budget' ? 'bg-primary-container text-on-primary-container glow-primary' : 'text-on-surface-variant hover:text-on-surface'"
          >
            Budgets & Charts
          </button>
        </div>

        <!-- Tab specific main actions -->
        <div class="flex gap-2 justify-end">
          <AppButton 
            v-if="activeTab === 'transactions'" 
            variant="solid" 
            color="primary" 
            class="py-2.5 px-4 text-xs"
            @click="openCreateTx"
          >
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            Add Transaction
          </AppButton>
          <AppButton 
            v-if="activeTab === 'subscriptions'" 
            variant="solid" 
            color="primary" 
            class="py-2.5 px-4 text-xs"
            @click="openCreateSub"
          >
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            Add Subscription
          </AppButton>
          <AppButton 
            v-if="activeTab === 'budget'" 
            variant="solid" 
            color="primary" 
            class="py-2.5 px-4 text-xs"
            @click="openCreateBudget"
          >
            <Icon name="heroicons:pencil-square" class="w-4 h-4 mr-2" />
            Set Budget
          </AppButton>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="glass rounded-xl p-8 border border-white/5">
        
        <!-- TRANSACTIONS TAB -->
        <div v-if="activeTab === 'transactions'" class="space-y-6">
          
          <!-- Filters Area -->
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div class="relative w-full sm:max-w-xs">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/50">
                <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
              </span>
              <input
                v-model="txSearchQuery"
                type="text"
                placeholder="Search transactions..."
                class="w-full bg-surface-container-low text-on-surface rounded-xl pl-10 pr-4 py-2.5 text-xs border border-outline-variant focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all duration-300"
              />
            </div>

            <div class="w-full sm:w-auto">
              <select
                v-model="txCategoryFilter"
                class="bg-surface-container-low text-on-surface rounded-xl px-4 py-2.5 text-xs border border-outline-variant focus:outline-none focus:border-primary-container transition-all duration-300 w-full sm:w-48"
              >
                <option value="">All Categories</option>
                <option v-for="cat in transactionCategories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>
          </div>

          <!-- Transactions list -->
          <div v-if="filteredTransactions.length === 0" class="text-center py-12 text-on-surface-variant text-sm font-body">
            No transactions found for this account. Click "Add Transaction" to log one.
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
                <tr v-for="tx in filteredTransactions" :key="tx.id" class="hover:bg-white/[0.02] transition-colors">
                  <td class="py-4 pr-4 font-mono text-xs text-on-surface-variant">
                    {{ formatDate(tx.date) }}
                  </td>
                  <td class="py-4 pr-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container-high border border-white/5">
                      {{ tx.category }}
                    </span>
                  </td>
                  <td class="py-4 pr-4 text-on-surface/90 truncate max-w-[200px]">
                    {{ tx.description || '—' }}
                  </td>
                  <td class="py-4 pr-4">
                    <AppBadge :color="tx.status === 'INCOME' ? 'success' : 'error'">
                      {{ tx.status }}
                    </AppBadge>
                  </td>
                  <td class="py-4 pr-4 text-right font-display font-bold" :class="tx.status === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'">
                    {{ tx.status === 'INCOME' ? '+' : '-' }}{{ tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ wallet.activeAccount.value?.currency }}
                  </td>
                  <td class="py-4 text-right">
                    <div class="flex justify-end gap-3">
                      <button @click="openEditTx(tx)" class="text-on-surface-variant hover:text-primary transition-colors">
                        <Icon name="heroicons:pencil-square" class="w-4.5 h-4.5" />
                      </button>
                      <button @click="confirmDeleteTx(tx.id)" class="text-on-surface-variant hover:text-error transition-colors">
                        <Icon name="heroicons:trash" class="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SUBSCRIPTIONS TAB -->
        <div v-if="activeTab === 'subscriptions'" class="space-y-6">
          
          <div v-if="wallet.subscriptions.value.length === 0" class="text-center py-12 text-on-surface-variant text-sm font-body">
            No recurring subscriptions logged. Track your Netflix, Spotify, or regular incomes by clicking "Add Subscription".
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="sub in wallet.subscriptions.value"
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
                  <button @click="openEditSub(sub)" class="text-on-surface-variant hover:text-primary transition-colors p-1">
                    <Icon name="heroicons:pencil-square" class="w-4.5 h-4.5" />
                  </button>
                  <button @click="confirmDeleteSub(sub.id)" class="text-on-surface-variant hover:text-error transition-colors p-1">
                    <Icon name="heroicons:trash" class="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              <!-- Dates & Pricing -->
              <div class="flex justify-between items-end border-t border-white/5 pt-4">
                <div class="flex flex-col gap-0.5 text-xs text-on-surface-variant">
                  <span>Start: {{ formatDate(sub.startDate) }}</span>
                  <span v-if="sub.endDate">End: {{ formatDate(sub.endDate) }}</span>
                </div>
                
                <div class="text-right flex flex-col items-end gap-1">
                  <span class="font-display font-bold text-lg" :class="sub.status === 'INCOME' ? 'text-emerald-400' : 'text-on-surface'">
                    {{ sub.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ wallet.activeAccount.value?.currency }}
                  </span>
                  <!-- Clickable status toggle -->
                  <button
                    @click="toggleSubPaid(sub)"
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

        <!-- BUDGETS & CHARTS TAB -->
        <div v-if="activeTab === 'budget'" class="space-y-8">
          
          <!-- Month Info / Tracker -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            <!-- Limit Status Card -->
            <div class="bg-surface-container-low/40 border border-white/5 p-6 rounded-xl flex flex-col justify-between gap-4 md:col-span-2">
              <div class="space-y-2">
                <h3 class="font-display font-semibold text-lg text-on-surface">Monthly Spending Tracker</h3>
                <p class="text-xs text-on-surface-variant">
                  Calculated against expense transactions and regular subscriptions this month.
                </p>
              </div>

              <!-- Progress Bar -->
              <div class="space-y-2">
                <div class="flex justify-between text-xs font-mono font-semibold uppercase text-on-surface-variant/70">
                  <span>Spent: {{ currentMonthSpending.toLocaleString() }} {{ wallet.activeAccount.value?.currency }}</span>
                  <span>Budget: {{ currentMonthBudget.toLocaleString() }} {{ wallet.activeAccount.value?.currency }}</span>
                </div>
                <div class="w-full bg-surface-container-low h-3 rounded-full overflow-hidden border border-white/5">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="[
                      currentMonthSpending >= currentMonthBudget 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600' 
                        : 'bg-gradient-to-r from-primary-container to-inverse-primary'
                    ]"
                    :style="{ width: `${budgetProgressPercentage}%` }"
                  />
                </div>
                <div class="text-right text-[10px] font-mono text-on-surface-variant">
                  {{ budgetProgressPercentage }}% of limit used
                </div>
              </div>

              <!-- Alert Banner -->
              <div v-if="budgetAlert" class="p-3.5 rounded-lg border text-xs" :class="[
                budgetAlert.type === 'error' && 'bg-error-container/10 border-error-container/30 text-error',
                budgetAlert.type === 'warning' && 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                budgetAlert.type === 'success' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              ]">
                {{ budgetAlert.message }}
              </div>
            </div>

            <!-- Set Budget Action Summary Card -->
            <div class="bg-surface-container-low/40 border border-white/5 p-6 rounded-xl flex flex-col justify-between gap-6">
              <div class="space-y-1">
                <span class="text-xs uppercase font-mono tracking-wider text-on-surface-variant/70">Current Month Budget</span>
                <div class="font-display font-extrabold text-2xl text-primary-container">
                  {{ currentMonthBudget.toLocaleString() }} {{ wallet.activeAccount.value?.currency }}
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <AppButton variant="solid" color="primary" class="w-full text-xs py-2.5" @click="openCreateBudget">
                  <Icon name="heroicons:pencil-square" class="w-4 h-4 mr-2" />
                  Update Budget Limit
                </AppButton>
                
                <AppButton v-if="currentMonthBudget > 0" variant="ghost" class="w-full text-xs py-2.5" @click="confirmDeleteBudget">
                  <Icon name="heroicons:trash" class="w-4 h-4 mr-2 text-error" />
                  Clear Budget Limit
                </AppButton>
              </div>
            </div>
          </div>

          <!-- History Custom Chart -->
          <div class="space-y-4 border-t border-white/5 pt-6">
            <h3 class="font-display font-semibold text-lg text-on-surface">6-Month Spending vs Budget Trend</h3>
            
            <!-- Custom HTML / CSS Chart rendering -->
            <div v-if="wallet.monthlyChart.value.length === 0" class="text-center py-12 text-on-surface-variant text-sm font-body">
              No historical data available yet.
            </div>

            <div v-else class="bg-surface-container-low/20 rounded-xl p-6 border border-white/5">
              <div class="h-64 flex items-end justify-between gap-4 pt-6 border-b border-white/10 pb-2 relative">
                <!-- Glowing background grids -->
                <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                  <div class="border-t border-white" />
                  <div class="border-t border-white" />
                  <div class="border-t border-white" />
                  <div class="border-t border-white" />
                </div>

                <div
                  v-for="item in wallet.monthlyChart.value"
                  :key="`${item.year}-${item.month}`"
                  class="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end"
                >
                  <!-- Tooltip popup on hover -->
                  <div class="absolute bottom-full mb-2 bg-surface-container-highest text-on-surface text-xs rounded px-3 py-2 border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-mono flex flex-col gap-0.5">
                    <span class="font-bold text-center border-b border-white/10 pb-0.5 mb-1 font-display">Month: {{ item.month }}/{{ item.year }}</span>
                    <span class="text-rose-400">Spent: {{ item.totalSpending.toLocaleString() }}</span>
                    <span class="text-primary-container">Budget: {{ item.budget ? item.budget.toLocaleString() : 'N/A' }}</span>
                  </div>

                  <!-- Chart Bars side-by-side -->
                  <div class="flex items-end gap-1.5 w-full max-w-[60px] h-48">
                    <!-- Spending Bar -->
                    <div
                      class="flex-1 rounded-t-sm transition-all duration-500 bg-gradient-to-t"
                      :class="[
                        item.budget && item.totalSpending >= item.budget
                          ? 'from-rose-600/70 to-red-500'
                          : 'from-primary-container/70 to-inverse-primary'
                      ]"
                      :style="{ 
                        height: `${Math.min(Math.round((item.totalSpending / Math.max(item.budget || 0, item.totalSpending || 1)) * 90), 90)}%` 
                      }"
                    />
                    
                    <!-- Budget Bar -->
                    <div
                      class="flex-1 rounded-t-sm transition-all duration-500 bg-white/10 border border-white/20"
                      :style="{ 
                        height: `${item.budget ? Math.min(Math.round((item.budget / Math.max(item.budget || 0, item.totalSpending || 1)) * 90), 90) : 0}%` 
                      }"
                    />
                  </div>

                  <!-- Month label -->
                  <span class="text-[10px] font-mono text-on-surface-variant font-semibold mt-1">
                    {{ item.month }}/{{ item.year }}
                  </span>
                </div>
              </div>

              <!-- Legends -->
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

      </div>
    </div>
    </div>

    <!-- MODALS SECTION -->
    
    <!-- Account Create/Edit Modal -->
    <AppModal v-model="showAccountModal" :title="isEditingAccount ? 'Edit Bank Account' : 'Create Bank Account'">
      <form @submit.prevent="submitAccount" class="space-y-5">
        <AppInput
          v-model="accountForm.name"
          label="Account Name"
          placeholder="e.g. CIH Main Account"
          required
        />
        <AppInput
          v-model="accountForm.bankName"
          label="Bank Name"
          placeholder="e.g. CIH Bank"
        />
        <AppInput
          v-model="accountForm.accountNumber"
          label="Account Number"
          placeholder="e.g. CIH-001"
          required
        />
        
        <!-- Only allow balance entry on creation -->
        <AppInput
          v-if="!isEditingAccount"
          v-model="accountForm.balance"
          type="number"
          label="Initial Balance"
          placeholder="e.g. 5000"
        />
        
        <AppInput
          v-model="accountForm.currency"
          label="Currency (3 letters)"
          placeholder="MAD"
          required
        />

        <div class="flex justify-end gap-3 pt-3 border-t border-white/5">
          <AppButton variant="ghost" @click="showAccountModal = false">
            Cancel
          </AppButton>
          <AppButton variant="solid" color="primary" type="submit" :loading="wallet.isLoading.value">
            {{ isEditingAccount ? 'Save Changes' : 'Create Account' }}
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Transaction Create/Edit Modal -->
    <AppModal v-model="showTxModal" :title="isEditingTx ? 'Edit Transaction' : 'Add Transaction'">
      <form @submit.prevent="submitTx" class="space-y-5">
        <!-- Type Selection -->
        <div class="flex flex-col gap-2">
          <label class="font-display font-medium text-xs tracking-wider uppercase text-on-surface-variant">
            Transaction Type
          </label>
          <div class="flex p-1 bg-surface-container-low rounded-xl border border-white/5">
            <button
              type="button"
              @click="txForm.status = 'EXPENSE'"
              class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              :class="txForm.status === 'EXPENSE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/20' : 'text-on-surface-variant hover:text-on-surface'"
            >
              Expense
            </button>
            <button
              type="button"
              @click="txForm.status = 'INCOME'"
              class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              :class="txForm.status === 'INCOME' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'text-on-surface-variant hover:text-on-surface'"
            >
              Income
            </button>
          </div>
        </div>

        <AppInput
          v-model="txForm.amount"
          type="number"
          label="Amount"
          placeholder="e.g. 1500"
          required
        />
        <AppInput
          v-model="txForm.category"
          label="Category"
          placeholder="e.g. Salary, Utilities, Food"
          required
        />
        <AppInput
          v-model="txForm.description"
          label="Description / Notes"
          placeholder="e.g. Monthly internet subscription"
        />
        <AppInput
          v-model="txForm.date"
          type="date"
          label="Date"
          required
        />

        <div class="flex justify-end gap-3 pt-3 border-t border-white/5">
          <AppButton variant="ghost" @click="showTxModal = false">
            Cancel
          </AppButton>
          <AppButton variant="solid" color="primary" type="submit" :loading="wallet.isLoading.value">
            {{ isEditingTx ? 'Save' : 'Add' }}
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Subscription Create/Edit Modal -->
    <AppModal v-model="showSubModal" :title="isEditingSub ? 'Edit Subscription' : 'Add Subscription'">
      <form @submit.prevent="submitSub" class="space-y-5">
        <AppInput
          v-model="subForm.name"
          label="Name"
          placeholder="e.g. Netflix, Gym"
          required
        />

        <!-- Type Selection -->
        <div class="flex flex-col gap-2">
          <label class="font-display font-medium text-xs tracking-wider uppercase text-on-surface-variant">
            Status Type
          </label>
          <div class="flex p-1 bg-surface-container-low rounded-xl border border-white/5">
            <button
              type="button"
              @click="subForm.status = 'EXPENSE'"
              class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              :class="subForm.status === 'EXPENSE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/20' : 'text-on-surface-variant hover:text-on-surface'"
            >
              Expense
            </button>
            <button
              type="button"
              @click="subForm.status = 'INCOME'"
              class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              :class="subForm.status === 'INCOME' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'text-on-surface-variant hover:text-on-surface'"
            >
              Income
            </button>
          </div>
        </div>

        <AppInput
          v-model="subForm.amount"
          type="number"
          label="Recurring Amount"
          placeholder="e.g. 99"
          required
        />
        <AppInput
          v-model="subForm.category"
          label="Category"
          placeholder="e.g. Entertainment, Health"
          required
        />
        <AppInput
          v-model="subForm.paymentMethod"
          label="Payment Method"
          placeholder="e.g. Credit Card, Direct Debit"
          required
        />

        <div class="flex items-center gap-3">
          <input
            id="subPaidCheckbox"
            type="checkbox"
            v-model="subForm.isPaid"
            class="w-4 h-4 rounded bg-surface-container border-outline-variant text-primary focus:ring-primary-container"
          />
          <label for="subPaidCheckbox" class="text-xs uppercase font-mono tracking-wider text-on-surface-variant select-none cursor-pointer">
            Mark as Paid for current cycle
          </label>
        </div>

        <AppInput
          v-model="subForm.startDate"
          type="date"
          label="Start Date"
          required
        />
        <AppInput
          v-model="subForm.endDate"
          type="date"
          label="End Date (Optional)"
        />

        <div class="flex justify-end gap-3 pt-3 border-t border-white/5">
          <AppButton variant="ghost" @click="showSubModal = false">
            Cancel
          </AppButton>
          <AppButton variant="solid" color="primary" type="submit" :loading="wallet.isLoading.value">
            {{ isEditingSub ? 'Save' : 'Add' }}
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Budget Upsert Modal -->
    <AppModal v-model="showBudgetModal" title="Set Monthly Budget Limit">
      <form @submit.prevent="submitBudget" class="space-y-5">
        <AppInput
          v-model="budgetForm.amount"
          type="number"
          label="Budget Limit Amount"
          placeholder="e.g. 5000"
          required
        />
        
        <div class="grid grid-cols-2 gap-4">
          <AppInput
            v-model="budgetForm.month"
            type="number"
            label="Month (1-12)"
            required
          />
          <AppInput
            v-model="budgetForm.year"
            type="number"
            label="Year (YYYY)"
            required
          />
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t border-white/5">
          <AppButton variant="ghost" @click="showBudgetModal = false">
            Cancel
          </AppButton>
          <AppButton variant="solid" color="primary" type="submit" :loading="wallet.isLoading.value">
            Set Budget Limit
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Confirm Delete Modal -->
    <AppModal v-model="showDeleteConfirm" title="Confirm Deletion">
      <div class="space-y-5">
        <p class="text-sm text-on-surface-variant font-body">
          Are you sure you want to delete this resource? This action is permanent and cannot be undone.
        </p>

        <div class="flex justify-end gap-3 pt-3 border-t border-white/5">
          <AppButton variant="ghost" @click="showDeleteConfirm = false">
            Cancel
          </AppButton>
          <AppButton variant="solid" color="error" @click="handleDelete" :loading="wallet.isLoading.value">
            Confirm Delete
          </AppButton>
        </div>
      </div>
    </AppModal>

  </div>
</template>
