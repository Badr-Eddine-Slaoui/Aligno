import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import {
  clearWalletData,
  createWalletUser,
  createBankAccount,
  getAuthToken,
  testUser,
  testUser2,
} from './helpers'

describe('Wallet API — Bank Accounts', async () => {
  await setup({})

  let token: string
  let token2: string

  beforeEach(async () => {
    await clearWalletData()
    await createWalletUser(testUser)
    await createWalletUser(testUser2)
    token = await getAuthToken(testUser.email)
    token2 = await getAuthToken(testUser2.email)
  })

  // ─── CREATE ───────────────────────────────────────────────────────────────

  it('should create a bank account successfully', async () => {
    const res = await createBankAccount(token)
    expect((res as any).success).toBe(true)
    expect((res as any).data.name).toBe('Test Account')
    expect((res as any).data.balance).toBe(1000)
    expect((res as any).data.currency).toBe('MAD')
  })

  it('should create a bank account with all optional fields', async () => {
    const res = await createBankAccount(token, {
      name: 'CIH Account',
      bankName: 'CIH Bank',
      accountNumber: 'CIH-001',
      balance: 5000,
      currency: 'EUR',
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.bankName).toBe('CIH Bank')
    expect((res as any).data.accountNumber).toBe('CIH-001')
    expect((res as any).data.currency).toBe('EUR')
  })

  it('should return 409 when account number is already in use', async () => {
    await createBankAccount(token, { accountNumber: 'ACC-DUP' })
    const res = await $fetch('/api/wallet/bank-accounts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Another', accountNumber: 'ACC-DUP' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 409).toBe(409)
  })

  it('should return 422 when name is missing', async () => {
    const res = await $fetch('/api/wallet/bank-accounts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { currency: 'MAD' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should return 422 when currency is not 3 letters', async () => {
    const res = await $fetch('/api/wallet/bank-accounts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Test', currency: 'EURO' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should return 401 when unauthenticated', async () => {
    const res = await $fetch('/api/wallet/bank-accounts', {
      method: 'POST',
      body: { name: 'No Auth' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 401).toBe(401)
  })

  // ─── GET ALL ──────────────────────────────────────────────────────────────

  it('should return only accounts belonging to the authenticated user', async () => {
    await createBankAccount(token, { name: 'Account A' })
    await createBankAccount(token, { name: 'Account B' })
    await createBankAccount(token2, { name: 'Other Account' })

    const res = await $fetch('/api/wallet/bank-accounts', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data).toHaveLength(2)
    expect((res as any).data.every((a: any) => a.name !== 'Other Account')).toBe(true)
  })

  it('should return empty array when user has no accounts', async () => {
    const res = await $fetch('/api/wallet/bank-accounts', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data).toHaveLength(0)
  })

  // ─── GET ONE ──────────────────────────────────────────────────────────────

  it('should get a single bank account by id', async () => {
    const created = await createBankAccount(token, { name: 'My Savings' })
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/bank-accounts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.id).toBe(id)
    expect((res as any).data.name).toBe('My Savings')
  })

  it('should return 404 when accessing another user account', async () => {
    const created = await createBankAccount(token2)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/bank-accounts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  it('should return 404 for a non-existent id', async () => {
    const res = await $fetch('/api/wallet/bank-accounts/nonexistent-id', {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  // ─── UPDATE ───────────────────────────────────────────────────────────────

  it('should update a bank account name and currency', async () => {
    const created = await createBankAccount(token)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/bank-accounts/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Updated Name', currency: 'EUR' },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.name).toBe('Updated Name')
    expect((res as any).data.currency).toBe('EUR')
  })

  it('should return 409 when updating to a duplicate account number', async () => {
    await createBankAccount(token, { accountNumber: 'ACC-001' })
    const second = await createBankAccount(token, { name: 'Second', accountNumber: 'ACC-002' })
    const id = (second as any).data.id

    const res = await $fetch(`/api/wallet/bank-accounts/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { accountNumber: 'ACC-001' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 409).toBe(409)
  })

  it('should return 404 when updating another user account', async () => {
    const created = await createBankAccount(token2)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/bank-accounts/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Hacked' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  // ─── DELETE ───────────────────────────────────────────────────────────────

  it('should delete a bank account', async () => {
    const created = await createBankAccount(token)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/bank-accounts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)

    const check = await $fetch(`/api/wallet/bank-accounts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((check as any).statusCode ?? 404).toBe(404)
  })

  it('should return 404 when deleting another user account', async () => {
    const created = await createBankAccount(token2)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/bank-accounts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })
})
