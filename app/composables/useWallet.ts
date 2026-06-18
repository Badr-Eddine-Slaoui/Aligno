import { storeToRefs } from 'pinia'
import { useWalletStore } from '~/stores/wallet'
import { useApiService } from '~/services/api'
import { parseApiError } from '~/utils/errors'

export const useWallet = () => {
  const api = useApiService()
  const store = useWalletStore()
  const notifications = useNotifications()

  const {
    bankAccounts,
    activeAccountId,
    transactions,
    subscriptions,
    budgets,
    monthlyChart,
    isLoading,
    activeAccount,
  } = storeToRefs(store)

  // ─── Bank Accounts ────────────────────────────────────────────────────────
  async function fetchBankAccounts() {
    store.isLoading = true
    try {
      const res = await api.wallet.listBankAccounts()
      if (res.success) {
        store.setBankAccounts(res.data)
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function createBankAccount(payload: { name: string; bankName?: string; accountNumber?: string; balance?: number; currency?: string }) {
    store.isLoading = true
    try {
      const res = await api.wallet.createBankAccount(payload)
      if (res.success) {
        store.upsertBankAccount(res.data)
        notifications.success('Bank account created successfully')
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function updateBankAccount(id: string, payload: { name?: string; bankName?: string; accountNumber?: string; balance?: number; currency?: string }) {
    store.isLoading = true
    try {
      const res = await api.wallet.updateBankAccount(id, payload)
      if (res.success) {
        store.upsertBankAccount(res.data)
        notifications.success('Bank account updated successfully')
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function deleteBankAccount(id: string) {
    store.isLoading = true
    try {
      const res = await api.wallet.deleteBankAccount(id)
      if (res.success) {
        store.removeBankAccount(id)
        notifications.success('Bank account deleted successfully')
      }
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  // ─── Transactions ─────────────────────────────────────────────────────────
  async function fetchTransactions(accountId: string) {
    store.isLoading = true
    try {
      const res = await api.wallet.listTransactions(accountId)
      if (res.success) {
        store.setTransactions(res.data)
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function createTransaction(payload: { status: 'INCOME' | 'EXPENSE'; amount: number; category: string; description?: string; date?: string; bankAccountId: string }) {
    store.isLoading = true
    try {
      const res = await api.wallet.createTransaction(payload)
      if (res.success) {
        store.upsertTransaction(res.data)
        // Refresh bank accounts list to show updated balance
        await fetchBankAccounts()
        notifications.success('Transaction added successfully')
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function updateTransaction(id: string, payload: { status?: 'INCOME' | 'EXPENSE'; amount?: number; category?: string; description?: string; date?: string }) {
    store.isLoading = true
    try {
      const res = await api.wallet.updateTransaction(id, payload)
      if (res.success) {
        store.upsertTransaction(res.data)
        // Refresh bank accounts list to show updated balance
        await fetchBankAccounts()
        notifications.success('Transaction updated successfully')
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function deleteTransaction(id: string) {
    store.isLoading = true
    try {
      const res = await api.wallet.deleteTransaction(id)
      if (res.success) {
        store.removeTransaction(id)
        // Refresh bank accounts list to show updated balance
        await fetchBankAccounts()
        notifications.success('Transaction deleted successfully')
      }
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────
  async function fetchSubscriptions(accountId: string) {
    store.isLoading = true
    try {
      const res = await api.wallet.listSubscriptions(accountId)
      if (res.success) {
        store.setSubscriptions(res.data)
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function createSubscription(payload: { name: string; status: 'INCOME' | 'EXPENSE'; amount: number; category: string; paymentMethod: string; isPaid?: boolean; startDate?: string; endDate?: string; bankAccountId: string }) {
    store.isLoading = true
    try {
      const res = await api.wallet.createSubscription(payload)
      if (res.success) {
        store.upsertSubscription(res.data)
        notifications.success('Subscription created successfully')
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function updateSubscription(id: string, payload: { name?: string; status?: 'INCOME' | 'EXPENSE'; amount?: number; category?: string; paymentMethod?: string; isPaid?: boolean; startDate?: string; endDate?: string }) {
    store.isLoading = true
    try {
      const res = await api.wallet.updateSubscription(id, payload)
      if (res.success) {
        store.upsertSubscription(res.data)
        notifications.success('Subscription updated successfully')
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function deleteSubscription(id: string) {
    store.isLoading = true
    try {
      const res = await api.wallet.deleteSubscription(id)
      if (res.success) {
        store.removeSubscription(id)
        notifications.success('Subscription deleted successfully')
      }
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  // ─── Budget ───────────────────────────────────────────────────────────────
  async function fetchBudgets() {
    store.isLoading = true
    try {
      const res = await api.wallet.listBudgets()
      if (res.success) {
        store.setBudgets(res.data)
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function fetchBudget(month: number, year: number) {
    try {
      const res = await api.wallet.getBudget(month, year)
      return res.data
    } catch (err) {
      const parsed = parseApiError(err)
      if (parsed.statusCode !== 404) {
        notifications.error(parsed.message)
      }
      throw err
    }
  }

  async function setBudget(payload: { amount: number; month: number; year: number }) {
    store.isLoading = true
    try {
      const res = await api.wallet.setBudget(payload)
      if (res.success) {
        store.upsertBudget(res.data)
        notifications.success('Budget set successfully')
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function deleteBudget(month: number, year: number) {
    store.isLoading = true
    try {
      const res = await api.wallet.deleteBudget(month, year)
      if (res.success) {
        store.removeBudget(month, year)
        notifications.success('Budget deleted successfully')
      }
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  async function fetchMonthlyChart(months?: number) {
    store.isLoading = true
    try {
      const res = await api.wallet.getMonthlyChart(months)
      if (res.success) {
        store.setMonthlyChart(res.data.chart)
      }
      return res.data
    } catch (err) {
      const { message } = parseApiError(err)
      notifications.error(message)
      throw err
    } finally {
      store.isLoading = false
    }
  }

  function setActiveAccountId(id: string | null) {
    store.setActiveAccountId(id)
  }

  return {
    // Refs
    bankAccounts,
    activeAccountId,
    transactions,
    subscriptions,
    budgets,
    monthlyChart,
    isLoading,
    activeAccount,
    // Bank Accounts
    fetchBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setActiveAccountId,
    // Transactions
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    // Subscriptions
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    // Budgets
    fetchBudgets,
    fetchBudget,
    setBudget,
    deleteBudget,
    // Charts
    fetchMonthlyChart,
  }
}
