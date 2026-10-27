import type { Transaction, TransactionStatus } from '@prisma/client'

export interface CreateTransactionData {
  status: TransactionStatus
  amount: number
  category: string
  description?: string
  date?: Date
  bankAccountId: string
}

export interface UpdateTransactionData {
  status?: TransactionStatus
  amount?: number
  category?: string
  description?: string
  date?: Date
}

export interface ITransactionDAO {
  create(data: CreateTransactionData): Promise<Transaction>
  findById(id: string): Promise<Transaction | null>
  findAllByBankAccount(bankAccountId: string): Promise<Transaction[]>
  update(id: string, data: UpdateTransactionData): Promise<Transaction>
  delete(id: string): Promise<void>
}
