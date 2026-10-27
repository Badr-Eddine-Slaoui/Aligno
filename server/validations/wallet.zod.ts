import { z } from 'zod'

export const createBankAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  bankName: z.string().max(100).optional(),
  accountNumber: z.string().max(50).optional(),
  balance: z.coerce.number().min(0).optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter code').toUpperCase().optional(),
})

export const updateBankAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bankName: z.string().max(100).optional(),
  accountNumber: z.string().max(50).optional(),
  balance: z.coerce.number().min(0).optional(),
  currency: z.string().length(3).toUpperCase().optional(),
})

const transactionStatus = z.enum(['INCOME', 'EXPENSE'])

export const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  status: transactionStatus,
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required').max(100),
  paymentMethod: z.string().min(1, 'Payment method is required').max(100),
  isPaid: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  bankAccountId: z.string().min(1, 'Bank account ID is required'),
})

export const updateSubscriptionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: transactionStatus.optional(),
  amount: z.coerce.number().positive().optional(),
  category: z.string().min(1).max(100).optional(),
  paymentMethod: z.string().min(1).max(100).optional(),
  isPaid: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export const createTransactionSchema = z.object({
  status: transactionStatus,
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().max(500).optional(),
  date: z.string().datetime().optional(),
  bankAccountId: z.string().min(1, 'Bank account ID is required'),
})

export const updateTransactionSchema = z.object({
  status: transactionStatus.optional(),
  amount: z.coerce.number().positive().optional(),
  category: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  date: z.string().datetime().optional(),
})

export const setBudgetSchema = z.object({
  amount: z.coerce.number().positive('Budget amount must be positive'),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
})

export const monthlyChartQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
})
