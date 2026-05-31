import type { SetBudgetDto, MonthlyChartResponseDto, BudgetResponseDto } from '../dto/wallet.dto'
import { budgetRepository } from '../repository/budget.repository'
import { logger } from '../utils/logger'

export class BudgetService {
  async setBudget(userId: string, dto: SetBudgetDto): Promise<BudgetResponseDto> {
    logger.info(`Setting budget for user ${userId}: ${dto.month}/${dto.year}`)
    return budgetRepository.upsert({ ...dto, userId })
  }

  async getBudget(userId: string, month: number, year: number): Promise<BudgetResponseDto | null> {
    return budgetRepository.findByMonth(userId, month, year)
  }

  async getAllBudgets(userId: string): Promise<BudgetResponseDto[]> {
    return budgetRepository.findAllByUser(userId)
  }

  async deleteBudget(userId: string, month: number, year: number): Promise<void> {
    const budget = await budgetRepository.findByMonth(userId, month, year)
    if (!budget || budget.userId !== userId) {
      throw createError({ statusCode: 404, statusMessage: 'Budget not found' })
    }
    await budgetRepository.delete(budget.id)
  }

  async getMonthlyChart(userId: string, months: number): Promise<MonthlyChartResponseDto> {
    const chart = await budgetRepository.getMonthlySpendingChart(userId, months)

    const enriched = await Promise.all(
      chart.map(async (entry) => {
        const budget = await budgetRepository.findByMonth(userId, entry.month, entry.year)
        const totalSpending = entry.transactions + entry.subscriptions
        const budgetAmount = budget?.amount ?? null

        let alert: string | null = null
        if (budgetAmount !== null) {
          if (totalSpending >= budgetAmount) {
            alert = `⚠️ Budget limit reached for ${entry.month}/${entry.year}: spent ${totalSpending} / ${budgetAmount}`
          } else if (totalSpending >= budgetAmount * 0.9) {
            alert = `🔔 Warning: 90% of budget used for ${entry.month}/${entry.year}: spent ${totalSpending} / ${budgetAmount}`
          }
        }

        return {
          month: entry.month,
          year: entry.year,
          transactions: entry.transactions,
          subscriptions: entry.subscriptions,
          totalSpending,
          budget: budgetAmount,
          alert,
        }
      }),
    )

    return { chart: enriched }
  }
}

export const budgetService = new BudgetService()
