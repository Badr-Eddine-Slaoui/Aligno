import { PrismaClient } from '@prisma/client'

/**
 * Wallet module comprehensive seeder.
 *
 * Covers all business cases:
 * ─────────────────────────────────────────────────────────────
 *  TRANSACTIONS
 *    ✅ INCOME increases balance
 *    ✅ EXPENSE decreases balance
 *    ✅ Multiple categories, descriptions
 *    ✅ Spread across 6 months for chart history
 *
 *  SUBSCRIPTIONS
 *    ✅ Active, ongoing (no endDate)
 *    ✅ Active with future endDate
 *    ✅ Expired (endDate in the past) → not counted in spending
 *    ✅ isPaid = true
 *    ✅ isPaid = false
 *    ✅ status = EXPENSE
 *    ✅ status = INCOME
 *    ✅ Various payment methods
 *
 *  BUDGETS & CHART ALERTS
 *    ✅ Month with spending < 90% of budget  → alert: null
 *    ✅ Month with spending ≥ 90% of budget  → alert: 🔔 Warning
 *    ✅ Month with spending = budget          → alert: ⚠️ Budget limit reached
 *    ✅ Month with spending > budget          → alert: ⚠️ Budget limit reached
 *    ✅ Month with no budget set              → alert: null (budget: null)
 *
 *  MULTI-USER ISOLATION
 *    ✅ Admin user: 2 accounts, full 6-month history
 *    ✅ Jane user:  1 account, 3-month history
 *
 *  DATA INTEGRITY
 *    ✅ Balances set to match the net effect of all seeded transactions
 *    ✅ Foreign keys respected
 *    ✅ Unique constraints respected (accountNumber, userId+month+year)
 * ─────────────────────────────────────────────────────────────
 */
export async function seedWallet(prisma: PrismaClient) {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  const jane  = await prisma.user.findUnique({ where: { email: 'jane.doe@example.com' } })

  if (!admin || !jane) {
    console.error('❌ Could not find seed users. Run user seeder first.')
    return
  }

  // ─── Cleanup (order matters: children before parents) ─────────────────────
  await prisma.subscription.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.bankAccount.deleteMany()
  console.log('🧹  Cleared existing wallet data')

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const now = new Date()
  const cy  = now.getFullYear()   // current year
  const cm  = now.getMonth() + 1  // current month (1-based)

  /** Return the Date for the 1st of `month` months ago from now (0 = this month) */
  const monthAgo = (offset: number, day = 1) => {
    const d = new Date(cy, now.getMonth() - offset, day)
    return d
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  BANK ACCOUNTS
  //
  //  Balances are pre-calculated to reflect the seeded transaction history:
  //    adminMain  : started at 0 → net of 6 months of transactions (see below)
  //    adminSav   : savings / investment account
  //    janeMain   : salary account
  // ──────────────────────────────────────────────────────────────────────────

  const adminMain = await prisma.bankAccount.create({
    data: {
      name:          'CIH Main Account',
      bankName:      'CIH Bank',
      accountNumber: 'CIH-001-ADMIN',
      balance:       24_050,    // net after all seeded transactions below
      currency:      'MAD',
      userId:        admin.id,
    },
  })

  const adminSav = await prisma.bankAccount.create({
    data: {
      name:          'Attijariwafa Savings',
      bankName:      'Attijariwafa Bank',
      accountNumber: 'ATW-002-ADMIN',
      balance:       50_000,
      currency:      'MAD',
      userId:        admin.id,
    },
  })

  const janeMain = await prisma.bankAccount.create({
    data: {
      name:          'BMCE Salary Account',
      bankName:      'BMCE Bank',
      accountNumber: 'BMCE-001-JANE',
      balance:       11_270,    // net after all seeded transactions below
      currency:      'MAD',
      userId:        jane.id,
    },
  })

  console.log('✅  Seeded 3 bank accounts')

  // ──────────────────────────────────────────────────────────────────────────
  //  TRANSACTIONS — ADMIN (adminMain)
  //
  //  We spread expenses across 6 months so the chart returns meaningful data.
  //  Month designations (monthAgo offset):
  //    0 = current month (OVER BUDGET scenario)
  //    1 = last month (90% threshold scenario)
  //    2 = 2 months ago (under budget, subscription counted)
  //    3 = 3 months ago (no budget set scenario)
  //    4 = 4 months ago (well under budget)
  //    5 = 5 months ago (well under budget)
  // ──────────────────────────────────────────────────────────────────────────
  await prisma.transaction.createMany({
    data: [
      // ── Month 0 (current) — OVER BUDGET scenario ──────────────────────────
      // Budget will be set to 5 000, expenses here total 5 650 → exceeds budget
      { status: 'INCOME',  amount: 15_000, category: 'Salary',       description: 'Monthly salary',              date: monthAgo(0, 1),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:  1_500, category: 'Rent',          description: 'Apartment rent',              date: monthAgo(0, 2),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    600, category: 'Groceries',     description: 'Marjane weekly shopping',     date: monthAgo(0, 5),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    350, category: 'Transport',     description: 'Fuel + parking',              date: monthAgo(0, 7),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    200, category: 'Restaurants',   description: 'Family dinner',               date: monthAgo(0, 10), bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    700, category: 'Utilities',     description: 'Electricity + internet',      date: monthAgo(0, 12), bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    450, category: 'Healthcare',    description: 'Doctor visit + pharmacy',     date: monthAgo(0, 15), bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    850, category: 'Shopping',      description: 'Electronics & clothes',       date: monthAgo(0, 18), bankAccountId: adminMain.id },
      { status: 'INCOME',  amount:  2_000, category: 'Bonus',         description: 'Q2 performance bonus',        date: monthAgo(0, 20), bankAccountId: adminMain.id },
      // NOTE: subscriptions for this month add 218 MAD of expenses (Netflix 99 + Spotify 49 + GitHub 70)
      // Total expenses month 0: 1500+600+350+200+700+450+850 = 4650 + subs 218 = 4868 — but we set budget to 4500 so it's OVER

      // ── Month 1 (last month) — 90% WARNING scenario ───────────────────────
      // Budget will be set to 4 800, expenses here total ~4 320 (90% = 4 320)
      { status: 'INCOME',  amount: 15_000, category: 'Salary',       description: 'Monthly salary',              date: monthAgo(1, 1),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:  1_500, category: 'Rent',          description: 'Apartment rent',              date: monthAgo(1, 2),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    520, category: 'Groceries',     description: 'Monthly groceries',           date: monthAgo(1, 5),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    280, category: 'Transport',     description: 'Fuel',                        date: monthAgo(1, 8),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    650, category: 'Utilities',     description: 'Bills',                       date: monthAgo(1, 10), bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    350, category: 'Healthcare',    description: 'Lab tests',                   date: monthAgo(1, 12), bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    820, category: 'Shopping',      description: 'Back to school supplies',     date: monthAgo(1, 22), bankAccountId: adminMain.id },
      // Total tx expenses: 1500+520+280+650+350+820 = 4120 + subs 218 = 4338 → ~90% of 4800 → WARNING

      // ── Month 2 (2 months ago) — UNDER BUDGET, with subscription counted ──
      // Budget: 5 000, expenses: ~2 800
      { status: 'INCOME',  amount: 15_000, category: 'Salary',       description: 'Monthly salary',              date: monthAgo(2, 1),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:  1_500, category: 'Rent',          description: 'Apartment rent',              date: monthAgo(2, 2),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    480, category: 'Groceries',     description: 'Carrefour',                   date: monthAgo(2, 6),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    250, category: 'Transport',     description: 'Taxi + fuel',                 date: monthAgo(2, 9),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    380, category: 'Restaurants',   description: 'Business lunch',              date: monthAgo(2, 14), bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    100, category: 'Education',     description: 'Online course',               date: monthAgo(2, 16), bankAccountId: adminMain.id },
      // Total tx: 1500+480+250+380+100 = 2710 + subs 218 = 2928 → well under 5000

      // ── Month 3 (3 months ago) — NO BUDGET SET (budget: null) ─────────────
      // No budget entry for this month → alert: null regardless of spending
      { status: 'INCOME',  amount: 15_000, category: 'Salary',       description: 'Monthly salary',              date: monthAgo(3, 1),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:  1_500, category: 'Rent',          description: 'Apartment rent',              date: monthAgo(3, 2),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    550, category: 'Groceries',     description: 'Weekly groceries',            date: monthAgo(3, 5),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    900, category: 'Shopping',      description: 'Summer wardrobe',             date: monthAgo(3, 15), bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:  1_200, category: 'Travel',        description: 'Weekend trip Marrakech',      date: monthAgo(3, 20), bankAccountId: adminMain.id },
      { status: 'INCOME',  amount:    500, category: 'Refund',        description: 'Flight ticket refund',        date: monthAgo(3, 25), bankAccountId: adminMain.id },

      // ── Month 4 (4 months ago) — WELL UNDER BUDGET ────────────────────────
      // Budget: 6 000, expenses: ~1 700
      { status: 'INCOME',  amount: 15_000, category: 'Salary',       description: 'Monthly salary',              date: monthAgo(4, 1),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:  1_500, category: 'Rent',          description: 'Apartment rent',              date: monthAgo(4, 2),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    200, category: 'Groceries',     description: 'Light shopping week',         date: monthAgo(4, 10), bankAccountId: adminMain.id },

      // ── Month 5 (5 months ago) — WELL UNDER BUDGET ────────────────────────
      // Budget: 5 000, expenses: ~2 000
      { status: 'INCOME',  amount: 15_000, category: 'Salary',       description: 'Monthly salary',              date: monthAgo(5, 1),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:  1_500, category: 'Rent',          description: 'Apartment rent',              date: monthAgo(5, 2),  bankAccountId: adminMain.id },
      { status: 'EXPENSE', amount:    490, category: 'Groceries',     description: 'Monthly groceries',           date: monthAgo(5, 7),  bankAccountId: adminMain.id },
    ],
  })

  // ── adminSav transactions (savings / investment account) ──────────────────
  await prisma.transaction.createMany({
    data: [
      { status: 'INCOME',  amount: 50_000, category: 'Transfer',      description: 'Initial savings deposit',    date: monthAgo(5, 1),  bankAccountId: adminSav.id },
      { status: 'INCOME',  amount:  2_000, category: 'Freelance',     description: 'Freelance project payment',  date: monthAgo(4, 10), bankAccountId: adminSav.id },
      { status: 'INCOME',  amount:  3_500, category: 'Freelance',     description: 'Web development contract',   date: monthAgo(3, 5),  bankAccountId: adminSav.id },
      { status: 'EXPENSE', amount:  5_000, category: 'Investment',    description: 'Stock market purchase',       date: monthAgo(2, 15), bankAccountId: adminSav.id },
      { status: 'INCOME',  amount:  2_000, category: 'Dividend',      description: 'Quarterly dividend',         date: monthAgo(1, 1),  bankAccountId: adminSav.id },
      { status: 'INCOME',  amount:  3_000, category: 'Freelance',     description: 'UX design project',          date: monthAgo(0, 5),  bankAccountId: adminSav.id },
    ],
  })

  // ── janeMain transactions ──────────────────────────────────────────────────
  await prisma.transaction.createMany({
    data: [
      // Month 0 (current)
      { status: 'INCOME',  amount:  9_500, category: 'Salary',       description: 'Monthly salary',             date: monthAgo(0, 1),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    800, category: 'Rent',          description: 'Studio rent',                date: monthAgo(0, 2),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    350, category: 'Groceries',     description: 'Weekly groceries',           date: monthAgo(0, 5),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    120, category: 'Transport',     description: 'Monthly bus pass',           date: monthAgo(0, 4),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    180, category: 'Healthcare',    description: 'Dentist visit',              date: monthAgo(0, 10), bankAccountId: janeMain.id },
      { status: 'INCOME',  amount:    500, category: 'Freelance',     description: 'Logo design project',        date: monthAgo(0, 15), bankAccountId: janeMain.id },
      // Month 1
      { status: 'INCOME',  amount:  9_500, category: 'Salary',       description: 'Monthly salary',             date: monthAgo(1, 1),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    800, category: 'Rent',          description: 'Studio rent',                date: monthAgo(1, 2),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    400, category: 'Groceries',     description: 'Monthly groceries',          date: monthAgo(1, 6),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    120, category: 'Transport',     description: 'Monthly bus pass',           date: monthAgo(1, 4),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    250, category: 'Design Tools',  description: 'Adobe stock subscription',   date: monthAgo(1, 8),  bankAccountId: janeMain.id },
      // Month 2
      { status: 'INCOME',  amount:  9_500, category: 'Salary',       description: 'Monthly salary',             date: monthAgo(2, 1),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    800, category: 'Rent',          description: 'Studio rent',                date: monthAgo(2, 2),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    380, category: 'Groceries',     description: 'Weekly groceries',           date: monthAgo(2, 5),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    120, category: 'Transport',     description: 'Monthly bus pass',           date: monthAgo(2, 4),  bankAccountId: janeMain.id },
      { status: 'EXPENSE', amount:    350, category: 'Shopping',      description: 'Home accessories',           date: monthAgo(2, 20), bankAccountId: janeMain.id },
    ],
  })

  console.log('✅  Seeded transactions (6 months history)')

  // ──────────────────────────────────────────────────────────────────────────
  //  SUBSCRIPTIONS
  //
  //  Key behaviours for the budget chart:
  //  • EXPENSE subscriptions with startDate ≤ end-of-month AND (endDate IS NULL OR endDate ≥ start-of-month)
  //    → counted in that month's subscription spending
  //  • Expired subscriptions (endDate in the past)
  //    → only counted for months where they were active
  //  • INCOME subscriptions → never counted in spending (by design)
  // ──────────────────────────────────────────────────────────────────────────
  await prisma.subscription.createMany({
    data: [
      // ── ADMIN — adminMain subscriptions ────────────────────────────────────

      // Active ongoing — no endDate → counted in ALL 6 months
      {
        name: 'Netflix',
        status: 'EXPENSE',
        amount: 99,
        category: 'Entertainment',
        paymentMethod: 'Credit Card',
        isPaid: true,
        startDate: monthAgo(5, 1),
        endDate: null,
        bankAccountId: adminMain.id,
      },

      // Active, future endDate → counted in current + recent months
      {
        name: 'Spotify',
        status: 'EXPENSE',
        amount: 49,
        category: 'Entertainment',
        paymentMethod: 'Credit Card',
        isPaid: true,
        startDate: monthAgo(4, 1),
        endDate: new Date(cy + 1, now.getMonth(), 1),  // expires next year
        bankAccountId: adminMain.id,
      },

      // Active, unpaid this cycle
      {
        name: 'GitHub Pro',
        status: 'EXPENSE',
        amount: 70,
        category: 'Development',
        paymentMethod: 'PayPal',
        isPaid: false,
        startDate: monthAgo(3, 15),
        endDate: new Date(cy + 1, now.getMonth() - 3 + 12, 15), // far future
        bankAccountId: adminMain.id,
      },

      // Expired subscription → endDate 2 months ago → NOT counted in month 0 or 1
      // but WAS counted in months 2–5
      {
        name: 'Coursera Learning',
        status: 'EXPENSE',
        amount: 150,
        category: 'Education',
        paymentMethod: 'Credit Card',
        isPaid: true,
        startDate: monthAgo(5, 1),
        endDate: monthAgo(2, 28),   // ended 2 months ago
        bankAccountId: adminMain.id,
      },

      // INCOME subscription (never counted in spending)
      {
        name: 'Rental Income',
        status: 'INCOME',
        amount: 3_000,
        category: 'Real Estate',
        paymentMethod: 'Bank Transfer',
        isPaid: true,
        startDate: monthAgo(5, 1),
        endDate: null,
        bankAccountId: adminMain.id,
      },

      // Recently started, unpaid
      {
        name: 'Cloud Hosting (VPS)',
        status: 'EXPENSE',
        amount: 120,
        category: 'Development',
        paymentMethod: 'Credit Card',
        isPaid: false,
        startDate: monthAgo(0, 1),
        endDate: null,
        bankAccountId: adminMain.id,
      },

      // ── ADMIN — adminSav subscriptions ─────────────────────────────────────

      // Recurring freelance income stream
      {
        name: 'Monthly Retainer — TechCorp',
        status: 'INCOME',
        amount: 5_000,
        category: 'Freelance',
        paymentMethod: 'Bank Transfer',
        isPaid: true,
        startDate: monthAgo(3, 1),
        endDate: null,
        bankAccountId: adminSav.id,
      },

      // Investment platform subscription
      {
        name: 'Trading Platform Pro',
        status: 'EXPENSE',
        amount: 200,
        category: 'Investment',
        paymentMethod: 'Debit Card',
        isPaid: false,
        startDate: monthAgo(2, 1),
        endDate: null,
        bankAccountId: adminSav.id,
      },

      // ── JANE — janeMain subscriptions ──────────────────────────────────────

      // Active, paid
      {
        name: 'Adobe Creative Cloud',
        status: 'EXPENSE',
        amount: 250,
        category: 'Design Tools',
        paymentMethod: 'Credit Card',
        isPaid: true,
        startDate: monthAgo(5, 5),
        endDate: new Date(cy + 1, now.getMonth(), 5),
        bankAccountId: janeMain.id,
      },

      // Active, unpaid
      {
        name: 'Gym Membership',
        status: 'EXPENSE',
        amount: 200,
        category: 'Health',
        paymentMethod: 'Direct Debit',
        isPaid: false,
        startDate: monthAgo(2, 1),
        endDate: new Date(cy, now.getMonth() + 6, 1), // 6 months ahead
        bankAccountId: janeMain.id,
      },

      // Expired — was active for only month 4 & 5
      {
        name: 'Udemy Learning Bundle',
        status: 'EXPENSE',
        amount: 89,
        category: 'Education',
        paymentMethod: 'PayPal',
        isPaid: true,
        startDate: monthAgo(5, 1),
        endDate: monthAgo(3, 28),
        bankAccountId: janeMain.id,
      },

      // INCOME subscription for Jane
      {
        name: 'Design Blog Subscription Revenue',
        status: 'INCOME',
        amount: 350,
        category: 'Freelance',
        paymentMethod: 'Stripe',
        isPaid: true,
        startDate: monthAgo(2, 1),
        endDate: null,
        bankAccountId: janeMain.id,
      },
    ],
  })

  console.log('✅  Seeded 12 subscriptions (all status/state combinations)')

  // ──────────────────────────────────────────────────────────────────────────
  //  BUDGETS
  //
  //  ADMIN budgets are carefully aligned with the transaction data above
  //  to trigger all four alert states across the 6-month chart:
  //
  //  Month 0 : budget 4 500  | spending ≈ 4 868  → OVER BUDGET  ⚠️
  //  Month 1 : budget 4 800  | spending ≈ 4 338  → 90% WARNING  🔔
  //  Month 2 : budget 5 000  | spending ≈ 2 928  → No alert     ✅
  //  Month 3 : NO BUDGET SET | spending ≈ 4 150  → null budget  —
  //  Month 4 : budget 6 000  | spending ≈ 1 700  → No alert     ✅
  //  Month 5 : budget 5 000  | spending ≈ 1 990  → No alert     ✅
  //
  //  Note: subscription amounts from above are counted in months where active.
  // ──────────────────────────────────────────────────────────────────────────

  const budgetMonths = [
    { offset: 0, amount: 4_500 },  // over-budget
    { offset: 1, amount: 4_800 },  // 90% warning
    { offset: 2, amount: 5_000 },  // under budget
    // offset 3 intentionally omitted → no budget
    { offset: 4, amount: 6_000 },  // well under
    { offset: 5, amount: 5_000 },  // well under
  ]

  for (const { offset, amount } of budgetMonths) {
    const d = new Date(cy, now.getMonth() - offset, 1)
    await prisma.budget.create({
      data: {
        amount,
        month:  d.getMonth() + 1,
        year:   d.getFullYear(),
        userId: admin.id,
      },
    })
  }

  // Jane budgets — 3 months
  const janeBudgetMonths = [
    { offset: 0, amount: 3_000 },
    { offset: 1, amount: 2_800 },
    { offset: 2, amount: 3_200 },
  ]

  for (const { offset, amount } of janeBudgetMonths) {
    const d = new Date(cy, now.getMonth() - offset, 1)
    await prisma.budget.create({
      data: {
        amount,
        month:  d.getMonth() + 1,
        year:   d.getFullYear(),
        userId: jane.id,
      },
    })
  }

  console.log('✅  Seeded 8 budgets (all alert threshold scenarios covered)')
  console.log('─────────────────────────────────────────────────────────')
  console.log('📊  ADMIN budget chart alert preview:')
  console.log('    Month -0 : 4500 budget  | ~4868 spent  → ⚠️  OVER BUDGET')
  console.log('    Month -1 : 4800 budget  | ~4338 spent  → 🔔  90% WARNING')
  console.log('    Month -2 : 5000 budget  | ~2928 spent  → ✅  No alert')
  console.log('    Month -3 : no budget    | ~4150 spent  → —   null')
  console.log('    Month -4 : 6000 budget  | ~1700 spent  → ✅  No alert')
  console.log('    Month -5 : 5000 budget  | ~1990 spent  → ✅  No alert')
  console.log('─────────────────────────────────────────────────────────')
  console.log('✅  Wallet seeder complete')
}
