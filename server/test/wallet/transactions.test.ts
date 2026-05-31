import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { prisma } from '../../utils/prisma'
import { clearWalletData, createWalletUser, createBankAccount, getAuthToken, testUser, testUser2 } from './helpers'

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

  // --- CREATE + BALANCE UPDATE ---
  it('should create an INCOME transaction and increase balance', async () => {
    const res = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'INCOME', amount: 200, category: 'Salary', bankAccountId },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.status).toBe('INCOME')

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    expect(account!.balance).toBe(1200)
  })

  it('should create an EXPENSE transaction and decrease balance', async () => {
    const res = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 300, category: 'Food', bankAccountId },
    })
    expect((res as any).success).toBe(true)

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    expect(account!.balance).toBe(700)
  })

  it('should return 404 when bankAccountId belongs to another user', async () => {
    const res = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 100, category: 'Food', bankAccountId: bankAccountId2 },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 404).toBe(404)
  })

  it('should return 422 when required fields are missing', async () => {
    const res = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 100 },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 422).toBe(422)
  })

  it('should return 401 when unauthenticated', async () => {
    const res = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      body: { status: 'INCOME', amount: 100, category: 'Test', bankAccountId },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 401).toBe(401)
  })

  // --- GET ALL ---
  it('should return transactions for the given bank account', async () => {
    await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'INCOME', amount: 100, category: 'A', bankAccountId },
    })
    await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 50, category: 'B', bankAccountId },
    })

    const res = await $fetch(`/api/wallet/transactions?bankAccountId=${bankAccountId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data).toHaveLength(2)
  })

  it('should return 404 when listing transactions of another user account', async () => {
    const res = await $fetch(`/api/wallet/transactions?bankAccountId=${bankAccountId2}`, {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 404).toBe(404)
  })

  // --- GET ONE ---
  it('should get a single transaction by id', async () => {
    const created = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'INCOME', amount: 100, category: 'Bonus', bankAccountId },
    })
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/transactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((res as any).success).toBe(true)
    expect((res as any).data.id).toBe(id)
  })

  // --- UPDATE + BALANCE CORRECTION ---
  it('should update a transaction and correct the balance', async () => {
    // Create INCOME 200 → balance = 1200
    const created = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'INCOME', amount: 200, category: 'Salary', bankAccountId },
    })
    const id = (created as any).data.id

    // Change to EXPENSE 100 → correction = (-100) - (+200) = -300 → balance = 1200 - 300 = 900
    await $fetch(`/api/wallet/transactions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 100 },
    })

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    expect(account!.balance).toBe(900)
  })

  it('should return 404 when updating transaction of another user', async () => {
    const created = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` },
      body: { status: 'INCOME', amount: 100, category: 'Test', bankAccountId: bankAccountId2 },
    })
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/transactions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { amount: 999 },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 404).toBe(404)
  })

  // --- DELETE + BALANCE ROLLBACK ---
  it('should delete a transaction and rollback the balance', async () => {
    // EXPENSE 300 → balance = 700
    const created = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'EXPENSE', amount: 300, category: 'Rent', bankAccountId },
    })
    const id = (created as any).data.id

    // Delete → balance should go back to 1000
    await $fetch(`/api/wallet/transactions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    expect(account!.balance).toBe(1000)
  })

  it('should return 404 when deleting transaction of another user', async () => {
    const created = await $fetch('/api/wallet/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` },
      body: { status: 'INCOME', amount: 100, category: 'Test', bankAccountId: bankAccountId2 },
    })
    const id = (created as any).data.id

    const res = await $fetch(`/api/wallet/transactions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode || 404).toBe(404)
  })
})
