import type { Budget } from '@prisma/client'
import type { IBudgetDAO, CreateBudgetData } from '../dao/budget.dao'
import { prisma } from '../utils/prisma'

export class BudgetRepository implements IBudgetDAO {
  async upsert(data: CreateBudgetData): Promise<Budget> {
    return prisma.budget.upsert({
      where: { userId_month_year: { userId: data.userId, month: data.month, year: data.year } },
      update: { amount: data.amount },
      create: data,
    })
  }

  async findByMonth(userId: string, month: number, year: number): Promise<Budget | null> {
    return prisma.budget.findUnique({
      where: { userId_month_year: { userId, month, year } },
    })
  }

  async findAllByUser(userId: string): Promise<Budget[]> {
    return prisma.budget.findMany({ where: { userId }, orderBy: [{ year: 'desc' }, { month: 'desc' }] })
  }

  async delete(id: string): Promise<void> {
    await prisma.budget.delete({ where: { id } })
  }

  // Returns total EXPENSE transactions for a user in a given month/year
  async getMonthlyTransactionExpenses(userId: string, month: number, year: number): Promise<number> {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 1)

    const result = await prisma.transaction.aggregate({
      where: {
        status: 'EXPENSE',
        date: { gte: start, lt: end },
        bankAccount: { userId },
      },
      _sum: { amount: true },
    })
    return result._sum.amount ?? 0
  }

  // Returns total EXPENSE subscriptions active in a given month/year
  async getMonthlySubscriptionExpenses(userId: string, month: number, year: number): Promise<number> {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 1)

    const result = await prisma.subscription.aggregate({
      where: {
        status: 'EXPENSE',
        startDate: { lte: end },
        OR: [{ endDate: null }, { endDate: { gte: start } }],
        bankAccount: { userId },
      },
      _sum: { amount: true },
    })
    return result._sum.amount ?? 0
  }

  // Returns monthly spending breakdown for the last N months (for chart)
  async getMonthlySpendingChart(userId: string, months: number): Promise<{ month: number; year: number; transactions: number; subscriptions: number }[]> {
    const result = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      const [transactions, subscriptions] = await Promise.all([
        this.getMonthlyTransactionExpenses(userId, m, y),
        this.getMonthlySubscriptionExpenses(userId, m, y),
      ])
      result.push({ month: m, year: y, transactions, subscriptions })
    }
    return result
  }
}

export const budgetRepository = new BudgetRepository()
