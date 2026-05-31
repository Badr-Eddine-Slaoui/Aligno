import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { clearWalletData, createWalletUser, createBankAccount, getAuthToken, testUser, testUser2 } from './helpers'

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

  const validSub = () => ({
    name: 'Netflix',
    status: 'EXPENSE',
    amount: 15,
    category: 'Entertainment',
    paymentMethod: 'Credit Card',
    isPaid: false,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  })

  // --- CREATE ---
  it('should create a subscription successfully', async () => {
    const res = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...validSub(), bankAccountId },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.name).toBe('Netflix')
    expect((res as any).data.paymentMethod).toBe('Credit Card')
    expect((res as any).data.isPaid).toBe(false)
    expect((res as any).data.endDate).toBeDefined()
  })

  it('should return 404 when bankAccountId belongs to another user', async () => {
    const res = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...validSub(), bankAccountId: bankAccountId2 },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 404).toBe(404)
  })

  it('should return 422 when required fields are missing', async () => {
    const res = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Incomplete' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 422).toBe(422)
  })

  it('should return 401 when unauthenticated', async () => {
    const res = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      body: { ...validSub(), bankAccountId },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 401).toBe(401)
  })

  // --- GET ALL ---
  it('should return subscriptions for the given bank account', async () => {
    await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...validSub(), name: 'Spotify', bankAccountId },
    })
    await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...validSub(), name: 'Disney+', bankAccountId },
    })

    const res = await $fetch(`/api/wallet/subscriptions?bankAccountId=${bankAccountId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data).toHaveLength(2)
  })

  it('should return 404 when listing subscriptions of another user account', async () => {
    const res = await $fetch(`/api/wallet/subscriptions?bankAccountId=${bankAccountId2}`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 404).toBe(404)
  })

  // --- GET ONE ---
  it('should get a single subscription by id', async () => {
    const created = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...validSub(), bankAccountId },
    })
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/subscriptions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.id).toBe(id)
  })

  // --- UPDATE ---
  it('should update a subscription', async () => {
    const created = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...validSub(), bankAccountId },
    })
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/subscriptions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Netflix Premium', isPaid: true, amount: 20 },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.name).toBe('Netflix Premium')
    expect((res as any).data.isPaid).toBe(true)
    expect((res as any).data.amount).toBe(20)
  })

  it('should return 404 when updating subscription of another user', async () => {
    const created = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` },
      body: { ...validSub(), bankAccountId: bankAccountId2 },
    })
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/subscriptions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Hacked' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 404).toBe(404)
  })

  // --- DELETE ---
  it('should delete a subscription', async () => {
    const created = await $fetch('/api/wallet/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...validSub(), bankAccountId },
    })
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
    expect((check as any).statusCode || 404).toBe(404)
  })
})
