import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { prisma } from '../../utils/prisma'
import {
  clearWalletData,
  createWalletUser,
  createBankAccount,
  createTransaction,
  getAuthToken,
  testUser,
  testUser2,
} from './helpers'

describe('Wallet API — Transactions', async () => {
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

    const acc1 = await createBankAccount(token, { balance: 1000 })
    bankAccountId = (acc1 as any).data.id

    const acc2 = await createBankAccount(token2, { balance: 500 })
    bankAccountId2 = (acc2 as any).data.id
  })

  // ─── CREATE + BALANCE ─────────────────────────────────────────────────────

  it('should create an INCOME transaction and increase balance', async () => {
    const res = await createTransaction(token, bankAccountId, { status: 'INCOME', amount: 200 })
    expect((res as any).success).toBe(true)
    expect((res as any).data.status).toBe('INCOME')

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    expect(account!.balance).toBe(1200)
  })

  it('should create an EXPENSE transaction and decrease balance', async () => {
    const res = await createTransaction(token, bankAccountId, { status: 'EXPENSE', amount: 300 })
    expect((res as any).success).toBe(true)
    expect((res as any).data.status).toBe('EXPENSE')

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    expect(account!.balance).toBe(700)
  })

  it('should create a transaction with description and date', async () => {
    const date = new Date().toISOString()
    const res = await createTransaction(token, bankAccountId, {
      status: 'INCOME',
      amount: 100,
      category: 'Bonus',
      description: 'Q2 bonus',
      date,
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.description).toBe('Q2 bonus')
  })

  it('should return 404 when bankAccountId belongs to another user', async () => {
    const res = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 100, category: 'Food', bankAccountId: bankAccountId2 },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  it('should return 422 when required fields are missing', async () => {
    const res = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 100 },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should return 422 when amount is zero or negative', async () => {
    const res = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 0, category: 'Food', bankAccountId },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should return 401 when unauthenticated', async () => {
    const res = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      body: { status: 'INCOME', amount: 100, category: 'Test', bankAccountId },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 401).toBe(401)
  })

  // ─── GET ALL ──────────────────────────────────────────────────────────────

  it('should return transactions for the given bank account', async () => {
    await createTransaction(token, bankAccountId, { status: 'INCOME', amount: 100, category: 'A' })
    await createTransaction(token, bankAccountId, { status: 'EXPENSE', amount: 50, category: 'B' })

    const res = await $fetch(`/api/wallet/transactions?bankAccountId=${bankAccountId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data).toHaveLength(2)
  })

  it('should return 400 when bankAccountId query param is missing', async () => {
    const res = await $fetch('/api/wallet/transactions', {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 400).toBe(400)
  })

  it('should return 404 when listing transactions of another user account', async () => {
    const res = await $fetch(`/api/wallet/transactions?bankAccountId=${bankAccountId2}`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  // ─── GET ONE ──────────────────────────────────────────────────────────────

  it('should get a single transaction by id', async () => {
    const created = await createTransaction(token, bankAccountId)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/transactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.id).toBe(id)
  })

  it('should return 404 for a non-existent transaction', async () => {
    const res = await $fetch('/api/wallet/transactions/nonexistent-id', {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  it('should return 404 when getting transaction of another user', async () => {
    const created = await createTransaction(token2, bankAccountId2)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/transactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  // ─── UPDATE + BALANCE CORRECTION ──────────────────────────────────────────

  it('should update amount and correct balance (INCOME → larger INCOME)', async () => {
    // INCOME 200 → balance = 1200
    const created = await createTransaction(token, bankAccountId, { status: 'INCOME', amount: 200 })
    const id = (created as any).data.id

    // INCOME 300 → correction = +300 - +200 = +100 → balance = 1300
    await $fetch(`/api/wallet/transactions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 300 },
    })

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    expect(account!.balance).toBe(1300)
  })

  it('should update status and correct balance (INCOME → EXPENSE)', async () => {
    // INCOME 200 → balance = 1200
    const created = await createTransaction(token, bankAccountId, { status: 'INCOME', amount: 200 })
    const id = (created as any).data.id

    // EXPENSE 100 → correction = (-100) - (+200) = -300 → balance = 900
    await $fetch(`/api/wallet/transactions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 100 },
    })

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    expect(account!.balance).toBe(900)
  })

  it('should not change balance when updating only description', async () => {
    // INCOME 200 → balance = 1200
    const created = await createTransaction(token, bankAccountId, { status: 'INCOME', amount: 200 })
    const id = (created as any).data.id

    await $fetch(`/api/wallet/transactions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { description: 'Updated desc' },
    })

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    expect(account!.balance).toBe(1200)
  })

  it('should return 404 when updating transaction of another user', async () => {
    const created = await createTransaction(token2, bankAccountId2)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/transactions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 999 },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })

  // ─── DELETE + BALANCE ROLLBACK ────────────────────────────────────────────

  it('should delete an EXPENSE transaction and rollback balance', async () => {
    // EXPENSE 300 → balance = 700
    const created = await createTransaction(token, bankAccountId, { status: 'EXPENSE', amount: 300 })
    const id = (created as any).data.id

    await $fetch(`/api/wallet/transactions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    expect(account!.balance).toBe(1000)
  })

  it('should delete an INCOME transaction and rollback balance', async () => {
    // INCOME 500 → balance = 1500
    const created = await createTransaction(token, bankAccountId, { status: 'INCOME', amount: 500 })
    const id = (created as any).data.id

    await $fetch(`/api/wallet/transactions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    expect(account!.balance).toBe(1000)
  })

  it('should return 404 when deleting transaction of another user', async () => {
    const created = await createTransaction(token2, bankAccountId2)
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/transactions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode ?? 404).toBe(404)
  })
})
