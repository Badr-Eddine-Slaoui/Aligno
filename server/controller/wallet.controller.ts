import type { H3Event } from 'h3'
import { bankAccountService } from '../service/bankAccount.service'
import { subscriptionService } from '../service/subscription.service'
import { transactionService } from '../service/transaction.service'
import { budgetService } from '../service/budget.service'
import {
  createBankAccountSchema,
  updateBankAccountSchema,
  createSubscriptionSchema,
  updateSubscriptionSchema,
  createTransactionSchema,
  updateTransactionSchema,
  setBudgetSchema,
  monthlyChartQuerySchema,
} from '../validations/wallet.zod'
import type { ZodError } from 'zod'
import { logger } from '../utils/logger'
import { sentry } from '../utils/sentry'

function formatZodErrors(error: ZodError) {
  const errors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (!errors[key]) errors[key] = []
    errors[key]!.push(issue.message)
  }
  return errors
}

export class WalletController {
  async createBankAccount(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const body = await readBody(event)
      const result = createBankAccountSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const account = await bankAccountService.create(userId, result.data)
      setResponseStatus(event, 201)
      logger.info(`Bank account created for user: ${userId}`)
      return { success: true, data: account }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getBankAccounts(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const accounts = await bankAccountService.getAll(userId)
      return { success: true, data: accounts }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getBankAccount(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const id = getRouterParam(event, 'id') as string
      const account = await bankAccountService.getOne(userId, id)
      return { success: true, data: account }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async updateBankAccount(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const id = getRouterParam(event, 'id') as string
      const body = await readBody(event)
      const result = updateBankAccountSchema.safeParse(body)

      if (!result.success) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Validation failed',
          data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) },
        })
      }

      const account = await bankAccountService.update(userId, id, result.data)
      return { success: true, data: account }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async deleteBankAccount(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const id = getRouterParam(event, 'id') as string
      await bankAccountService.delete(userId, id)
      return { success: true, data: { message: 'Bank account deleted successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  // --- Subscriptions ---

  async createSubscription(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const body = await readBody(event)
      const result = createSubscriptionSchema.safeParse(body)
      if (!result.success) {
        throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) } })
      }
      const sub = await subscriptionService.create(userId, result.data)
      setResponseStatus(event, 201)
      return { success: true, data: sub }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getSubscriptions(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const bankAccountId = getQuery(event).bankAccountId as string
      if (!bankAccountId) throw createError({ statusCode: 400, statusMessage: 'bankAccountId query param is required' })
      const subs = await subscriptionService.getAll(userId, bankAccountId)
      return { success: true, data: subs }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getSubscription(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const id = getRouterParam(event, 'id') as string
      const sub = await subscriptionService.getOne(userId, id)
      return { success: true, data: sub }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async updateSubscription(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const id = getRouterParam(event, 'id') as string
      const body = await readBody(event)
      const result = updateSubscriptionSchema.safeParse(body)
      if (!result.success) {
        throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) } })
      }
      const sub = await subscriptionService.update(userId, id, result.data)
      return { success: true, data: sub }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async deleteSubscription(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const id = getRouterParam(event, 'id') as string
      await subscriptionService.delete(userId, id)
      return { success: true, data: { message: 'Subscription deleted successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  // --- Transactions ---

  async createTransaction(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const body = await readBody(event)
      const result = createTransactionSchema.safeParse(body)
      if (!result.success) {
        throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) } })
      }
      const tx = await transactionService.create(userId, result.data)
      setResponseStatus(event, 201)
      return { success: true, data: tx }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getTransactions(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const bankAccountId = getQuery(event).bankAccountId as string
      if (!bankAccountId) throw createError({ statusCode: 400, statusMessage: 'bankAccountId query param is required' })
      const txs = await transactionService.getAll(userId, bankAccountId)
      return { success: true, data: txs }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getTransaction(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const id = getRouterParam(event, 'id') as string
      const tx = await transactionService.getOne(userId, id)
      return { success: true, data: tx }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async updateTransaction(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const id = getRouterParam(event, 'id') as string
      const body = await readBody(event)
      const result = updateTransactionSchema.safeParse(body)
      if (!result.success) {
        throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) } })
      }
      const tx = await transactionService.update(userId, id, result.data)
      return { success: true, data: tx }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async deleteTransaction(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const id = getRouterParam(event, 'id') as string
      await transactionService.delete(userId, id)
      return { success: true, data: { message: 'Transaction deleted successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  // --- Budget & Chart ---

  async setBudget(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const body = await readBody(event)
      const result = setBudgetSchema.safeParse(body)
      if (!result.success) {
        throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) } })
      }
      const budget = await budgetService.setBudget(userId, result.data)
      return { success: true, data: budget }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getBudget(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const { month, year } = getQuery(event)
      const result = setBudgetSchema.pick({ month: true, year: true }).safeParse({ month, year })
      if (!result.success) {
        throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) } })
      }
      const budget = await budgetService.getBudget(userId, result.data.month, result.data.year)
      if (!budget) throw createError({ statusCode: 404, statusMessage: 'Budget not found' })
      return { success: true, data: budget }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getAllBudgets(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const budgets = await budgetService.getAllBudgets(userId)
      return { success: true, data: budgets }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async deleteBudget(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const { month, year } = getQuery(event)
      const result = setBudgetSchema.pick({ month: true, year: true }).safeParse({ month, year })
      if (!result.success) {
        throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) } })
      }
      await budgetService.deleteBudget(userId, result.data.month, result.data.year)
      return { success: true, data: { message: 'Budget deleted successfully' } }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }

  async getMonthlyChart(event: H3Event) {
    try {
      const userId = event.context.userId as string
      const result = monthlyChartQuerySchema.safeParse(getQuery(event))
      if (!result.success) {
        throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { success: false, message: 'Validation failed', errors: formatZodErrors(result.error) } })
      }
      const data = await budgetService.getMonthlyChart(userId, result.data.months)
      return { success: true, data }
    } catch (error: any) {
      if (error.statusCode && error.statusCode < 500) throw error
      sentry.captureException(error)
      throw error
    }
  }
}

export const walletController = new WalletController()
