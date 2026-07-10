<script setup lang="ts">
const appUrl = useRuntimeConfig().public.appUrl

useSeoMeta({
  title: 'Wallet & Finance – Aligno',
  description: 'Track multiple bank accounts, monitor recurring subscriptions, create monthly budgets, and analyze spending habits in Aligno.',
  ogTitle: 'Wallet & Finance Tracker – Aligno',
  ogDescription: 'Track multiple bank accounts, monitor recurring subscriptions, create monthly budgets, and analyze spending habits.',
  ogType: 'website',
  ogUrl: `${appUrl}/wallet`,
  ogImage: `${appUrl}/og-image.png`,
  ogImageWidth: '1200',
  ogImageHeight: '630',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Wallet & Finance Tracker – Aligno',
  twitterDescription: 'Track accounts, budgets, expenses and subscriptions in Aligno.',
  robots: 'noindex, nofollow',
})

useHead({
  link: [{ rel: 'canonical', href: `${appUrl}/wallet` }],
})
import type { BankAccount, Transaction, Subscription } from '~/types'

definePageMeta({ layout: 'default' })

const wallet = useWallet()

const activeTab = ref<'transactions' | 'subscriptions' | 'budget'>('transactions')

// ─── Account modal ────────────────────────────────────────────────────────────
const showAccountModal = ref(false)
const editingAccount = ref<BankAccount | null>(null)

const openCreateAccount = () => { editingAccount.value = null; showAccountModal.value = true }
const openEditAccount = (acc: BankAccount) => { editingAccount.value = acc; showAccountModal.value = true }

const onAccountSaved = async () => {
  await wallet.fetchMonthlyChart()
}

// ─── Transaction modal ────────────────────────────────────────────────────────
const showTxModal = ref(false)
const editingTx = ref<Transaction | null>(null)

const openCreateTx = () => { if (!wallet.activeAccountId.value) return; editingTx.value = null; showTxModal.value = true }
const openEditTx = (tx: Transaction) => { editingTx.value = tx; showTxModal.value = true }

const onTxSaved = async () => {
  await wallet.fetchMonthlyChart()
}

// ─── Subscription modal ───────────────────────────────────────────────────────
const showSubModal = ref(false)
const editingSub = ref<Subscription | null>(null)

const openCreateSub = () => { if (!wallet.activeAccountId.value) return; editingSub.value = null; showSubModal.value = true }
const openEditSub = (sub: Subscription) => { editingSub.value = sub; showSubModal.value = true }

const onSubSaved = async () => {
  await wallet.fetchMonthlyChart()
}

const toggleSubPaid = async (sub: Subscription) => {
  try {
    await wallet.updateSubscription(sub.id, { isPaid: !sub.isPaid })
    await wallet.fetchMonthlyChart()
  } catch {}
}

// ─── Budget modal ─────────────────────────────────────────────────────────────
const showBudgetModal = ref(false)

const onBudgetSaved = async () => {
  await wallet.fetchMonthlyChart()
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deleteTarget = ref<{ type: 'account' | 'transaction' | 'subscription' | 'budget'; id: string } | null>(null)

const confirmDelete = (type: 'account' | 'transaction' | 'subscription' | 'budget', id: string) => {
  deleteTarget.value = { type, id }
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  try {
    const { type, id } = deleteTarget.value
    if (type === 'account') await wallet.deleteBankAccount(id)
    else if (type === 'transaction') await wallet.deleteTransaction(id)
    else if (type === 'subscription') await wallet.deleteSubscription(id)
    else if (type === 'budget') {
      const now = new Date()
      await wallet.deleteBudget(now.getMonth() + 1, now.getFullYear())
    }
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await wallet.fetchMonthlyChart()
  } catch {}
}

// ─── Budget computed values ───────────────────────────────────────────────────
const currentMonthSpending = computed(() => {
  const now = new Date()
  const item = wallet.monthlyChart.value.find(i => i.month === now.getMonth() + 1 && i.year === now.getFullYear())
  return item?.totalSpending ?? 0
})

const currentMonthBudget = computed(() => {
  const now = new Date()
  const item = wallet.monthlyChart.value.find(i => i.month === now.getMonth() + 1 && i.year === now.getFullYear())
  return item?.budget ?? 0
})

// ─── Net worth ────────────────────────────────────────────────────────────────
const netWorth = computed(() => {
  const totals: Record<string, number> = {}
  wallet.bankAccounts.value.forEach(acc => {
    totals[acc.currency] = (totals[acc.currency] || 0) + acc.balance
  })
  return Object.entries(totals).map(([currency, balance]) => ({ currency, balance }))
})

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await wallet.fetchBankAccounts()
  await wallet.fetchMonthlyChart()
  if (wallet.activeAccountId.value) {
    await Promise.all([
      wallet.fetchTransactions(wallet.activeAccountId.value),
      wallet.fetchSubscriptions(wallet.activeAccountId.value),
    ])
  }
})

watch(wallet.activeAccountId, async (id) => {
  if (id) {
    await Promise.all([
      wallet.fetchTransactions(id),
      wallet.fetchSubscriptions(id),
    ])
  }
})
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- Loading -->
    <div v-if="wallet.isLoading.value && wallet.bankAccounts.value.length === 0" class="flex flex-col justify-center items-center py-24 space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container" />
      <span class="text-sm font-mono text-on-surface-variant">Loading financial dashboard...</span>
    </div>

    <div v-else class="space-y-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div class="space-y-1">
          <h1 class="font-display font-extrabold text-3xl text-on-surface tracking-tight bg-gradient-to-r from-primary-container to-inverse-primary bg-clip-text text-transparent">
            Financial Center
          </h1>
          <p class="text-sm text-on-surface-variant font-body">
            Oversee your bank accounts, transactions, budget tracking, and regular subscriptions.
          </p>
        </div>

        <!-- Net Worth -->
        <div class="flex items-center gap-4 bg-surface-container-low/40 p-4 rounded-xl border border-white/5 select-none self-stretch sm:self-auto justify-between">
          <div class="flex flex-col">
            <span class="text-xs uppercase font-mono tracking-wider text-on-surface-variant/70">Total Assets</span>
            <div class="flex gap-2 items-baseline">
              <template v-if="netWorth.length === 0">
                <span class="font-display font-bold text-lg text-on-surface">0.00 MAD</span>
              </template>
              <div v-else class="flex flex-col">
                <span v-for="net in netWorth" :key="net.currency" class="font-display font-bold text-lg text-primary-container">
                  {{ net.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ net.currency }}
                </span>
              </div>
            </div>
          </div>
          <div class="p-2.5 bg-primary-container/10 rounded-lg text-primary-container">
            <Icon name="heroicons:wallet" class="w-6 h-6" />
          </div>
        </div>
      </div>

      <!-- Accounts section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-display font-semibold text-lg text-on-surface">My Accounts</h2>
          <AppButton variant="ghost" class="py-2 px-4 text-xs" @click="openCreateAccount">
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />Add Account
          </AppButton>
        </div>

        <!-- Empty state -->
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
          <AppButton variant="solid" color="primary" @click="openCreateAccount">Create First Account</AppButton>
        </div>

        <!-- Account cards grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <WalletAccountCard
            v-for="acc in wallet.bankAccounts.value"
            :key="acc.id"
            :account="acc"
            :is-active="wallet.activeAccountId.value === acc.id"
            @select="wallet.setActiveAccountId($event)"
            @edit="openEditAccount"
            @delete="confirmDelete('account', $event)"
          />
        </div>
      </div>

      <!-- Active account detail (tabs) -->
      <div v-if="wallet.activeAccount.value" class="space-y-6">

        <!-- Tab bar + action -->
        <div class="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-surface-container/20 p-4 rounded-xl border border-white/5">
          <div class="flex p-1 bg-surface-container-low rounded-xl border border-white/5 self-start">
            <button
              v-for="tab in (['transactions', 'subscriptions', 'budget'] as const)"
              :key="tab"
              @click="activeTab = tab"
              class="px-4 py-2 text-xs font-semibold font-display uppercase tracking-wider rounded-lg transition-all duration-300"
              :class="activeTab === tab ? 'bg-primary-container text-on-primary-container glow-primary' : 'text-on-surface-variant hover:text-on-surface'"
            >
              {{ tab === 'budget' ? 'Budgets & Charts' : tab }}
            </button>
          </div>

          <div class="flex gap-2 justify-end">
            <AppButton v-if="activeTab === 'transactions'" variant="solid" color="primary" class="py-2.5 px-4 text-xs" @click="openCreateTx">
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />Add Transaction
            </AppButton>
            <AppButton v-if="activeTab === 'subscriptions'" variant="solid" color="primary" class="py-2.5 px-4 text-xs" @click="openCreateSub">
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />Add Subscription
            </AppButton>
            <AppButton v-if="activeTab === 'budget'" variant="solid" color="primary" class="py-2.5 px-4 text-xs" @click="showBudgetModal = true">
              <Icon name="heroicons:pencil-square" class="w-4 h-4 mr-2" />Set Budget
            </AppButton>
          </div>
        </div>

        <!-- Tab content -->
        <div class="glass rounded-xl p-8 border border-white/5">
          <WalletTransactionTable
            v-if="activeTab === 'transactions'"
            :transactions="wallet.transactions.value"
            :currency="wallet.activeAccount.value?.currency"
            @edit="openEditTx"
            @delete="confirmDelete('transaction', $event)"
          />

          <WalletSubscriptionGrid
            v-if="activeTab === 'subscriptions'"
            :subscriptions="wallet.subscriptions.value"
            :currency="wallet.activeAccount.value?.currency"
            @edit="openEditSub"
            @delete="confirmDelete('subscription', $event)"
            @toggle-paid="toggleSubPaid"
          />

          <WalletBudgetTab
            v-if="activeTab === 'budget'"
            :monthly-chart="wallet.monthlyChart.value"
            :current-month-spending="currentMonthSpending"
            :current-month-budget="currentMonthBudget"
            :currency="wallet.activeAccount.value?.currency"
            @set-budget="showBudgetModal = true"
            @delete-budget="confirmDelete('budget', '')"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <WalletAccountModal
      v-model="showAccountModal"
      :account="editingAccount"
      @saved="onAccountSaved"
    />

    <WalletTransactionModal
      v-model="showTxModal"
      :transaction="editingTx"
      :bank-account-id="wallet.activeAccountId.value ?? ''"
      @saved="onTxSaved"
    />

    <WalletSubscriptionModal
      v-model="showSubModal"
      :subscription="editingSub"
      :bank-account-id="wallet.activeAccountId.value ?? ''"
      @saved="onSubSaved"
    />

    <WalletBudgetModal
      v-model="showBudgetModal"
      :current-amount="currentMonthBudget"
      @saved="onBudgetSaved"
    />

    <WalletDeleteConfirm
      v-model="showDeleteConfirm"
      :loading="wallet.isLoading.value"
      @confirm="handleDelete"
    />
  </div>
</template>
