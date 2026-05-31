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
  email: 'other.user@example.com',
  phone: '+212600000011',
  password: 'SuperSecurePassword123!',
}

export async function clearWalletData() {
  await prisma.subscription.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.bankAccount.deleteMany()
  await prisma.user.deleteMany()
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
