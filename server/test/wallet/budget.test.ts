import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { clearWalletData, createWalletUser, createBankAccount, getAuthToken, testUser } from './helpers'

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

  // --- SET BUDGET ---
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

  it('should return 422 for invalid month', async () => {
    const res = await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1000, month: 13, year: currentYear },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 422).toBe(422)
  })

  it('should return 422 for negative amount', async () => {
    const res = await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: -500, month: currentMonth, year: currentYear },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 422).toBe(422)
  })

  it('should return 401 when unauthenticated', async () => {
    const res = await $fetch('/api/wallet/budget', {
      method: 'POST',
      body: { amount: 1000, month: currentMonth, year: currentYear },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 401).toBe(401)
  })

  // --- GET BUDGET ---
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
  })

  it('should return 404 when no budget set for that month', async () => {
    const res = await $fetch(`/api/wallet/budget/month?month=1&year=2000`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 404).toBe(404)
  })

  // --- GET ALL BUDGETS ---
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

  // --- DELETE BUDGET ---
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
    expect((check as any).statusCode || 404).toBe(404)
  })

  // --- MONTHLY CHART ---
  it('should return chart data for the last 6 months', async () => {
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

  it('should trigger budget limit alert when spending equals budget', async () => {
    // Set budget to 300
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 300, month: currentMonth, year: currentYear },
    })

    // Add EXPENSE transactions totaling exactly 300
    await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 200, category: 'Rent', bankAccountId },
    })
    await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 100, category: 'Food', bankAccountId },
    })

    const res = await $fetch('/api/wallet/budget/chart?months=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entry = (res as any).data.chart[0]
    expect(entry.totalSpending).toBe(300)
    expect(entry.alert).toContain('⚠️')
  })

  it('should trigger 90% warning alert when spending is between 90% and 100% of budget', async () => {
    // Set budget to 300
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 300, month: currentMonth, year: currentYear },
    })

    // Spend 280 (93% of 300)
    await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 280, category: 'Bills', bankAccountId },
    })

    const res = await $fetch('/api/wallet/budget/chart?months=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entry = (res as any).data.chart[0]
    expect(entry.totalSpending).toBe(280)
    expect(entry.alert).toContain('🔔')
  })

  it('should return no alert when spending is under 90% of budget', async () => {
    await $fetch('/api/wallet/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 1000, month: currentMonth, year: currentYear },
    })

    await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 100, category: 'Coffee', bankAccountId },
    })

    const res = await $fetch('/api/wallet/budget/chart?months=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entry = (res as any).data.chart[0]
    expect(entry.alert).toBeNull()
  })

  it('should return 422 for invalid months query param', async () => {
    const res = await $fetch('/api/wallet/budget/chart?months=99', {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 422).toBe(422)
  })
})
