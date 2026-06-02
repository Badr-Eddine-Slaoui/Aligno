import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import {
  clearWalletData,
  createWalletUser,
  createBankAccount,
  createTransaction,
  createSubscription,
  getAuthToken,
  testUser,
} from './helpers'

describe('Wallet API — Budget & Chart', async () => {
  await setup({})

  let token: string
  let bankAccountId: string

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  beforeEach(async () => {
    await clearWalletData()
    await createWalletUser(testUser)
    token = await getAuthToken(testUser.email)

    const acc = await createBankAccount(token, { balance: 5000 })
    bankAccountId = (acc as any).data.id
  })

  // ─── SET / UPSERT BUDGET ──────────────────────────────────────────────────

  it('should create a budget for a month', async () => {
    const res = await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1000, month: currentMonth, year: currentYear },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.amount).toBe(1000)
    expect((res as any).data.month).toBe(currentMonth)
    expect((res as any).data.year).toBe(currentYear)
  })

  it('should upsert (update) an existing budget for the same month', async () => {
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1000, month: currentMonth, year: currentYear },
    })
    const res = await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1500, month: currentMonth, year: currentYear },
    })
    expect((res as any).data.amount).toBe(1500)
  })

  it('should create budgets for multiple months independently', async () => {
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1000, month: 1, year: currentYear },
    })
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1200, month: 2, year: currentYear },
    })

    const all = await $fetch('/api/wallet/budget', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((all as any).data.length).toBeGreaterThanOrEqual(2)
  })

  it('should return 422 for invalid month (> 12)', async () => {
    const res = await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1000, month: 13, year: currentYear },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should return 422 for invalid month (< 1)', async () => {
    const res = await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1000, month: 0, year: currentYear },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should return 422 for negative amount', async () => {
    const res = await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: -500, month: currentMonth, year: currentYear },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should return 401 when unauthenticated', async () => {
    const res = await $fetch('/api/wallet/budget', {
      method: 'POST',
      body: { amount: 1000, month: currentMonth, year: currentYear },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 401).toBe(401)
  })

  // ─── GET BUDGET BY MONTH ──────────────────────────────────────────────────

  it('should get a budget by month and year', async () => {
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 800, month: currentMonth, year: currentYear },
    })

    const res = await $fetch(`/api/wallet/budget/month?month=${currentMonth}&year=${currentYear}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.amount).toBe(800)
    expect((res as any).data.month).toBe(currentMonth)
  })

  it('should return 404 when no budget set for that month', async () => {
    const res = await $fetch('/api/wallet/budget/month?month=1&year=2000', {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  it('should return 422 when month query param is missing', async () => {
    const res = await $fetch(`/api/wallet/budget/month?year=${currentYear}`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  // ─── GET ALL BUDGETS ──────────────────────────────────────────────────────

  it('should return all budgets for the user', async () => {
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1000, month: 1, year: currentYear },
    })
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1200, month: 2, year: currentYear },
    })

    const res = await $fetch('/api/wallet/budget', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.length).toBeGreaterThanOrEqual(2)
  })

  it('should return empty array when user has no budgets', async () => {
    const res = await $fetch('/api/wallet/budget', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data).toHaveLength(0)
  })

  // ─── DELETE BUDGET ────────────────────────────────────────────────────────

  it('should delete a budget', async () => {
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1000, month: currentMonth, year: currentYear },
    })

    const res = await $fetch(`/api/wallet/budget/month?month=${currentMonth}&year=${currentYear}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)

    const check = await $fetch(`/api/wallet/budget/month?month=${currentMonth}&year=${currentYear}`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((check as any).statusCode ?? 404).toBe(404)
  })

  it('should return 404 when deleting a non-existent budget', async () => {
    const res = await $fetch('/api/wallet/budget/month?month=1&year=2000', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  // ─── MONTHLY CHART ────────────────────────────────────────────────────────

  it('should return chart data for the last 6 months with correct shape', async () => {
    const res = await $fetch('/api/wallet/budget/chart?months=6', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.chart).toHaveLength(6)

    const entry = (res as any).data.chart[0]
    expect(entry).toHaveProperty('month')
    expect(entry).toHaveProperty('year')
    expect(entry).toHaveProperty('transactions')
    expect(entry).toHaveProperty('subscriptions')
    expect(entry).toHaveProperty('totalSpending')
    expect(entry).toHaveProperty('budget')
    expect(entry).toHaveProperty('alert')
  })

  it('should return alert null when no budget is set', async () => {
    const res = await $fetch('/api/wallet/budget/chart?months=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entry = (res as any).data.chart[0]
    expect(entry.budget).toBeNull()
    expect(entry.alert).toBeNull()
  })

  it('should trigger ⚠️ alert when spending equals budget', async () => {
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 300, month: currentMonth, year: currentYear },
    })
    await createTransaction(token, bankAccountId, { status: 'EXPENSE', amount: 200, category: 'Rent' })
    await createTransaction(token, bankAccountId, { status: 'EXPENSE', amount: 100, category: 'Food' })

    const res = await $fetch('/api/wallet/budget/chart?months=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entry = (res as any).data.chart[0]
    expect(entry.totalSpending).toBe(300)
    expect(entry.alert).toContain('⚠️')
  })

  it('should trigger ⚠️ alert when spending exceeds budget', async () => {
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 200, month: currentMonth, year: currentYear },
    })
    await createTransaction(token, bankAccountId, { status: 'EXPENSE', amount: 250, category: 'Bills' })

    const res = await $fetch('/api/wallet/budget/chart?months=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entry = (res as any).data.chart[0]
    expect(entry.alert).toContain('⚠️')
  })

  it('should trigger 🔔 warning when spending is between 90% and 100% of budget', async () => {
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 300, month: currentMonth, year: currentYear },
    })
    await createTransaction(token, bankAccountId, { status: 'EXPENSE', amount: 280, category: 'Bills' })

    const res = await $fetch('/api/wallet/budget/chart?months=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entry = (res as any).data.chart[0]
    expect(entry.totalSpending).toBe(280)
    expect(entry.alert).toContain('🔔')
  })

  it('should return null alert when spending is under 90% of budget', async () => {
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1000, month: currentMonth, year: currentYear },
    })
    await createTransaction(token, bankAccountId, { status: 'EXPENSE', amount: 100, category: 'Coffee' })

    const res = await $fetch('/api/wallet/budget/chart?months=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entry = (res as any).data.chart[0]
    expect(entry.alert).toBeNull()
  })

  it('should include subscriptions in totalSpending for the chart', async () => {
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 500, month: currentMonth, year: currentYear },
    })
    // EXPENSE transaction: 100
    await createTransaction(token, bankAccountId, { status: 'EXPENSE', amount: 100, category: 'Food' })
    // EXPENSE subscription active this month: 50
    await createSubscription(token, bankAccountId, { amount: 50, status: 'EXPENSE' })

    const res = await $fetch('/api/wallet/budget/chart?months=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entry = (res as any).data.chart[0]
    expect(entry.transactions).toBe(100)
    expect(entry.subscriptions).toBe(50)
    expect(entry.totalSpending).toBe(150)
  })

  it('should not count INCOME transactions in totalSpending', async () => {
    await createTransaction(token, bankAccountId, { status: 'INCOME', amount: 5000, category: 'Salary' })

    const res = await $fetch('/api/wallet/budget/chart?months=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entry = (res as any).data.chart[0]
    expect(entry.transactions).toBe(0)
    expect(entry.totalSpending).toBe(0)
  })

  it('should return 422 for months query param out of range', async () => {
    const res = await $fetch('/api/wallet/budget/chart?months=99', {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should use default 6 months when months param not provided', async () => {
    const res = await $fetch('/api/wallet/budget/chart', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.chart).toHaveLength(6)
  })
})
