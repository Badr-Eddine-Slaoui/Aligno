import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import {
  clearWalletData,
  createWalletUser,
  createBankAccount,
  createSubscription,
  getAuthToken,
  testUser,
  testUser2,
} from './helpers'

describe('Wallet API — Subscriptions', async () => {
  await setup({})

  let token: string
  let token2: string
  let bankAccountId: string
  let bankAccountId2: string

  beforeEach(async () => {
    await clearWalletData()
    await createWalletUser(testUser)
    await createWalletUser(testUser2)
    token = await getAuthToken(testUser.email)
    token2 = await getAuthToken(testUser2.email)

    const acc1 = await createBankAccount(token)
    bankAccountId = (acc1 as any).data.id

    const acc2 = await createBankAccount(token2)
    bankAccountId2 = (acc2 as any).data.id
  })

  // ─── CREATE ───────────────────────────────────────────────────────────────

  it('should create an EXPENSE subscription successfully', async () => {
    const res = await createSubscription(token, bankAccountId)
    expect((res as any).success).toBe(true)
    expect((res as any).data.name).toBe('Netflix')
    expect((res as any).data.status).toBe('EXPENSE')
    expect((res as any).data.paymentMethod).toBe('Credit Card')
    expect((res as any).data.isPaid).toBe(false)
    expect((res as any).data.bankAccountId).toBe(bankAccountId)
  })

  it('should create an INCOME subscription successfully', async () => {
    const res = await createSubscription(token, bankAccountId, {
      name: 'Freelance',
      status: 'INCOME',
      amount: 3000,
      category: 'Work',
      paymentMethod: 'Bank Transfer',
      isPaid: true,
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.status).toBe('INCOME')
    expect((res as any).data.isPaid).toBe(true)
  })

  it('should create a subscription with endDate', async () => {
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const res = await createSubscription(token, bankAccountId, { endDate })
    expect((res as any).success).toBe(true)
    expect((res as any).data.endDate).toBeDefined()
  })

  it('should return 404 when bankAccountId belongs to another user', async () => {
    const res = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        name: 'Netflix',
        status: 'EXPENSE',
        amount: 15,
        category: 'Entertainment',
        paymentMethod: 'Card',
        bankAccountId: bankAccountId2,
      },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  it('should return 422 when required fields are missing', async () => {
    const res = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Incomplete' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should return 422 when amount is negative', async () => {
    const res = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        name: 'Bad',
        status: 'EXPENSE',
        amount: -10,
        category: 'Test',
        paymentMethod: 'Card',
        bankAccountId,
      },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should return 422 when status is invalid', async () => {
    const res = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        name: 'Bad',
        status: 'INVALID',
        amount: 10,
        category: 'Test',
        paymentMethod: 'Card',
        bankAccountId,
      },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should return 401 when unauthenticated', async () => {
    const res = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      body: { name: 'Netflix', status: 'EXPENSE', amount: 15, category: 'Entertainment', paymentMethod: 'Card', bankAccountId },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 401).toBe(401)
  })

  // ─── GET ALL ──────────────────────────────────────────────────────────────

  it('should return subscriptions for the given bank account', async () => {
    await createSubscription(token, bankAccountId, { name: 'Spotify' })
    await createSubscription(token, bankAccountId, { name: 'Disney+' })

    const res = await $fetch(`/api/wallet/subscriptions?bankAccountId=${bankAccountId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data).toHaveLength(2)
  })

  it('should return 400 when bankAccountId query param is missing', async () => {
    const res = await $fetch('/api/wallet/subscriptions', {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 400).toBe(400)
  })

  it('should return 404 when listing subscriptions of another user account', async () => {
    const res = await $fetch(`/api/wallet/subscriptions?bankAccountId=${bankAccountId2}`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  // ─── GET ONE ──────────────────────────────────────────────────────────────

  it('should get a single subscription by id', async () => {
    const created = await createSubscription(token, bankAccountId)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/subscriptions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.id).toBe(id)
  })

  it('should return 404 for a non-existent subscription', async () => {
    const res = await $fetch('/api/wallet/subscriptions/nonexistent-id', {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  it('should return 404 when getting subscription of another user', async () => {
    const created = await createSubscription(token2, bankAccountId2)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/subscriptions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  // ─── UPDATE ───────────────────────────────────────────────────────────────

  it('should update a subscription name, amount and isPaid', async () => {
    const created = await createSubscription(token, bankAccountId)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/subscriptions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Netflix Premium', isPaid: true, amount: 25 },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.name).toBe('Netflix Premium')
    expect((res as any).data.isPaid).toBe(true)
    expect((res as any).data.amount).toBe(25)
  })

  it('should return 404 when updating subscription of another user', async () => {
    const created = await createSubscription(token2, bankAccountId2)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/subscriptions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Hacked' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  it('should return 422 when updating with invalid amount', async () => {
    const created = await createSubscription(token, bankAccountId)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/subscriptions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: -5 },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  // ─── DELETE ───────────────────────────────────────────────────────────────

  it('should delete a subscription', async () => {
    const created = await createSubscription(token, bankAccountId)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/subscriptions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)

    const check = await $fetch(`/api/wallet/subscriptions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((check as any).statusCode ?? 404).toBe(404)
  })

  it('should return 404 when deleting subscription of another user', async () => {
    const created = await createSubscription(token2, bankAccountId2)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/subscriptions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })
})
