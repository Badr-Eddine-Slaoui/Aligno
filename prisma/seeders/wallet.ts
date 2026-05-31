import { PrismaClient } from '@prisma/client'

export async function seedWallet(prisma: PrismaClient) {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  const jane = await prisma.user.findUnique({ where: { email: 'jane.doe@example.com' } })

  if (!admin || !jane) {
    console.error('❌ Could not find users for wallet seeding.')
    return
  }

  // Clear existing wallet data
  await prisma.subscription.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.bankAccount.deleteMany()
  console.log('🧹 Cleared existing wallet data')

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

  // ─── ADMIN bank accounts ───────────────────────────────────────────────────
  const adminMain = await prisma.bankAccount.create({
    data: {
      name: 'CIH Main Account',
      bankName: 'CIH Bank',
      accountNumber: 'CIH-001-ADMIN',
      balance: 12500,
      currency: 'MAD',
      userId: admin.id,
    },
  })

  const adminSavings = await prisma.bankAccount.create({
    data: {
      name: 'Attijariwafa Savings',
      bankName: 'Attijariwafa Bank',
      accountNumber: 'ATW-002-ADMIN',
      balance: 45000,
      currency: 'MAD',
      userId: admin.id,
    },
  })

  // ─── JANE bank accounts ────────────────────────────────────────────────────
  const janeMain = await prisma.bankAccount.create({
    data: {
      name: 'BMCE Salary Account',
      bankName: 'BMCE Bank',
      accountNumber: 'BMCE-001-JANE',
      balance: 8200,
      currency: 'MAD',
      userId: jane.id,
    },
  })

  console.log('✅ Seeded 3 bank accounts')

  // ─── ADMIN subscriptions ───────────────────────────────────────────────────
  await prisma.subscription.createMany({
    data: [
      {
        name: 'Netflix',
        status: 'EXPENSE',
        amount: 99,
        category: 'Entertainment',
        paymentMethod: 'Credit Card',
        isPaid: true,
        startDate: new Date(currentYear, currentMonth - 1, 1),
        endDate: new Date(currentYear, currentMonth, 1),
        bankAccountId: adminMain.id,
      },
      {
        name: 'Spotify',
        status: 'EXPENSE',
        amount: 49,
        category: 'Entertainment',
        paymentMethod: 'Credit Card',
        isPaid: true,
        startDate: new Date(currentYear, currentMonth - 1, 1),
        endDate: new Date(currentYear + 1, currentMonth - 1, 1),
        bankAccountId: adminMain.id,
      },
      {
        name: 'GitHub Pro',
        status: 'EXPENSE',
        amount: 70,
        category: 'Development',
        paymentMethod: 'PayPal',
        isPaid: false,
        startDate: new Date(currentYear, currentMonth - 1, 15),
        endDate: new Date(currentYear + 1, currentMonth - 1, 15),
        bankAccountId: adminMain.id,
      },
      {
        name: 'Freelance Income',
        status: 'INCOME',
        amount: 3000,
        category: 'Freelance',
        paymentMethod: 'Bank Transfer',
        isPaid: true,
        startDate: new Date(currentYear, currentMonth - 1, 1),
        endDate: null,
        bankAccountId: adminSavings.id,
      },
    ],
  })

  // ─── JANE subscriptions ────────────────────────────────────────────────────
  await prisma.subscription.createMany({
    data: [
      {
        name: 'Adobe Creative Cloud',
        status: 'EXPENSE',
        amount: 250,
        category: 'Design Tools',
        paymentMethod: 'Credit Card',
        isPaid: true,
        startDate: new Date(currentYear, currentMonth - 1, 5),
        endDate: new Date(currentYear + 1, currentMonth - 1, 5),
        bankAccountId: janeMain.id,
      },
      {
        name: 'Gym Membership',
        status: 'EXPENSE',
        amount: 200,
        category: 'Health',
        paymentMethod: 'Direct Debit',
        isPaid: false,
        startDate: new Date(currentYear, currentMonth - 1, 1),
        endDate: new Date(currentYear, currentMonth + 5, 1),
        bankAccountId: janeMain.id,
      },
    ],
  })

  console.log('✅ Seeded 6 subscriptions')

  // ─── ADMIN transactions (current month) ───────────────────────────────────
  await prisma.transaction.createMany({
    data: [
      {
        status: 'INCOME',
        amount: 15000,
        category: 'Salary',
        description: 'Monthly salary — June 2025',
        date: new Date(currentYear, currentMonth - 1, 1),
        bankAccountId: adminMain.id,
      },
      {
        status: 'EXPENSE',
        amount: 1200,
        category: 'Rent',
        description: 'Apartment rent',
        date: new Date(currentYear, currentMonth - 1, 3),
        bankAccountId: adminMain.id,
      },
      {
        status: 'EXPENSE',
        amount: 450,
        category: 'Groceries',
        description: 'Marjane weekly shopping',
        date: new Date(currentYear, currentMonth - 1, 7),
        bankAccountId: adminMain.id,
      },
      {
        status: 'EXPENSE',
        amount: 300,
        category: 'Transport',
        description: 'Fuel + parking',
        date: new Date(currentYear, currentMonth - 1, 10),
        bankAccountId: adminMain.id,
      },
      {
        status: 'EXPENSE',
        amount: 180,
        category: 'Restaurants',
        description: 'Team lunch',
        date: new Date(currentYear, currentMonth - 1, 14),
        bankAccountId: adminMain.id,
      },
      {
        status: 'INCOME',
        amount: 2000,
        category: 'Bonus',
        description: 'Performance bonus Q2',
        date: new Date(currentYear, currentMonth - 1, 15),
        bankAccountId: adminSavings.id,
      },
      {
        status: 'EXPENSE',
        amount: 600,
        category: 'Utilities',
        description: 'Electricity + internet bills',
        date: new Date(currentYear, currentMonth - 1, 18),
        bankAccountId: adminMain.id,
      },
    ],
  })

  // ─── ADMIN transactions (previous month) ──────────────────────────────────
  await prisma.transaction.createMany({
    data: [
      {
        status: 'INCOME',
        amount: 15000,
        category: 'Salary',
        description: 'Monthly salary — previous month',
        date: new Date(prevYear, prevMonth - 1, 1),
        bankAccountId: adminMain.id,
      },
      {
        status: 'EXPENSE',
        amount: 1200,
        category: 'Rent',
        description: 'Apartment rent',
        date: new Date(prevYear, prevMonth - 1, 3),
        bankAccountId: adminMain.id,
      },
      {
        status: 'EXPENSE',
        amount: 520,
        category: 'Groceries',
        description: 'Monthly groceries',
        date: new Date(prevYear, prevMonth - 1, 8),
        bankAccountId: adminMain.id,
      },
      {
        status: 'EXPENSE',
        amount: 250,
        category: 'Transport',
        description: 'Fuel',
        date: new Date(prevYear, prevMonth - 1, 12),
        bankAccountId: adminMain.id,
      },
      {
        status: 'EXPENSE',
        amount: 900,
        category: 'Shopping',
        description: 'Clothes & accessories',
        date: new Date(prevYear, prevMonth - 1, 20),
        bankAccountId: adminMain.id,
      },
    ],
  })

  // ─── JANE transactions ─────────────────────────────────────────────────────
  await prisma.transaction.createMany({
    data: [
      {
        status: 'INCOME',
        amount: 9500,
        category: 'Salary',
        description: 'Monthly salary',
        date: new Date(currentYear, currentMonth - 1, 1),
        bankAccountId: janeMain.id,
      },
      {
        status: 'EXPENSE',
        amount: 800,
        category: 'Rent',
        description: 'Studio rent',
        date: new Date(currentYear, currentMonth - 1, 2),
        bankAccountId: janeMain.id,
      },
      {
        status: 'EXPENSE',
        amount: 350,
        category: 'Groceries',
        description: 'Weekly groceries',
        date: new Date(currentYear, currentMonth - 1, 6),
        bankAccountId: janeMain.id,
      },
      {
        status: 'EXPENSE',
        amount: 120,
        category: 'Transport',
        description: 'Monthly bus pass',
        date: new Date(currentYear, currentMonth - 1, 4),
        bankAccountId: janeMain.id,
      },
    ],
  })

  console.log('✅ Seeded 16 transactions')

  // ─── ADMIN budgets ─────────────────────────────────────────────────────────
  await prisma.budget.createMany({
    data: [
      { amount: 5000, month: currentMonth, year: currentYear, userId: admin.id },
      { amount: 4800, month: prevMonth, year: prevYear, userId: admin.id },
    ],
  })

  // ─── JANE budgets ──────────────────────────────────────────────────────────
  await prisma.budget.createMany({
    data: [
      { amount: 3000, month: currentMonth, year: currentYear, userId: jane.id },
    ],
  })

  console.log('✅ Seeded 3 budgets')
}
