import bcrypt from 'bcrypt'
import { prisma } from '../../utils/prisma'
import { $fetch } from '@nuxt/test-utils/e2e'

export const testUser = {
  firstName: 'Wallet',
  lastName: 'Tester',
  age: 28,
  email: 'wallet.tester@example.com',
  phone: '+212600000010',
  password: 'SuperSecurePassword123!',
}

export const testUser2 = {
  firstName: 'Other',
  lastName: 'User',
  age: 30,
  email: 'other.wallet@example.com',
  phone: '+212600000011',
  password: 'SuperSecurePassword123!',
}

export async function clearWalletData() {
  const walletEmails = [testUser.email, testUser2.email]
  // Delete wallet-specific data only for our test users to avoid
  // contaminating other tests running in parallel that share the same DB.
  const users = await prisma.user.findMany({ where: { email: { in: walletEmails } }, select: { id: true } })
  const userIds = users.map(u => u.id)
  if (userIds.length > 0) {
    await prisma.subscription.deleteMany({ where: { bankAccount: { userId: { in: userIds } } } })
    await prisma.transaction.deleteMany({ where: { bankAccount: { userId: { in: userIds } } } })
    await prisma.budget.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.bankAccount.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.user.deleteMany({ where: { id: { in: userIds } } })
  }
}

export async function createWalletUser(data = testUser) {
  const passwordHash = await bcrypt.hash(data.password, 10)
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      email: data.email,
      phone: data.phone,
      passwordHash,
      emailVerified: true,
    },
  })
}

export async function getAuthToken(email: string, password = 'SuperSecurePassword123!') {
  const res = await $fetch('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  return (res as any).data.accessToken as string
}

export async function createBankAccount(token: string, overrides: Record<string, any> = {}) {
  return $fetch('/api/wallet/bank-accounts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: { name: 'Test Account', currency: 'MAD', balance: 1000, ...overrides },
  })
}

export async function createSubscription(token: string, bankAccountId: string, overrides: Record<string, any> = {}) {
  return $fetch('/api/wallet/subscriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      name: 'Netflix',
      status: 'EXPENSE',
      amount: 15,
      category: 'Entertainment',
      paymentMethod: 'Credit Card',
      isPaid: false,
      bankAccountId,
      ...overrides,
    },
  })
}

export async function createTransaction(token: string, bankAccountId: string, overrides: Record<string, any> = {}) {
  return $fetch('/api/wallet/transactions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      status: 'INCOME',
      amount: 500,
      category: 'Salary',
      bankAccountId,
      ...overrides,
    },
  })
}
