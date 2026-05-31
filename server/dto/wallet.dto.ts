export interface CreateBankAccountDto {
  name: string
  bankName?: string
  accountNumber?: string
  balance?: number
  currency?: string
}

export interface UpdateBankAccountDto {
  name?: string
  bankName?: string
  accountNumber?: string
  balance?: number
  currency?: string
}

export interface BankAccountResponseDto {
  id: string
  name: string
  bankName: string | null
  accountNumber: string | null
  balance: number
  currency: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Subscription
export interface CreateSubscriptionDto {
  name: string
  status: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  paymentMethod: string
  isPaid?: boolean
  startDate?: string
  endDate?: string
  bankAccountId: string
}

export interface UpdateSubscriptionDto {
  name?: string
  status?: 'INCOME' | 'EXPENSE'
  amount?: number
  category?: string
  paymentMethod?: string
  isPaid?: boolean
  startDate?: string
  endDate?: string
}

export interface SubscriptionResponseDto {
  id: string
  name: string
  status: string
  amount: number
  category: string
  paymentMethod: string
  isPaid: boolean
  startDate: Date
  endDate: Date | null
  bankAccountId: string
  createdAt: Date
  updatedAt: Date
}

// Transaction
export interface CreateTransactionDto {
  status: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  description?: string
  date?: string
  bankAccountId: string
}

export interface UpdateTransactionDto {
  status?: 'INCOME' | 'EXPENSE'
  amount?: number
  category?: string
  description?: string
  date?: string
}

export interface TransactionResponseDto {
  id: string
  status: string
  amount: number
  category: string
  description: string | null
  date: Date
  bankAccountId: string
  createdAt: Date
  updatedAt: Date
}

// Budget
export interface SetBudgetDto {
  amount: number
  month: number
  year: number
}

export interface BudgetResponseDto {
  id: string
  amount: number
  month: number
  year: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface MonthlyChartEntryDto {
  month: number
  year: number
  transactions: number
  subscriptions: number
  totalSpending: number
  budget: number | null
  alert: string | null
}

export interface MonthlyChartResponseDto {
  chart: MonthlyChartEntryDto[]
}
