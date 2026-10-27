import type { Subscription, TransactionStatus } from '@prisma/client'

export interface CreateSubscriptionData {
  name: string
  status: TransactionStatus
  amount: number
  category: string
  paymentMethod: string
  isPaid?: boolean
  startDate?: Date
  endDate?: Date
  bankAccountId: string
}

export interface UpdateSubscriptionData {
  name?: string
  status?: TransactionStatus
  amount?: number
  category?: string
  paymentMethod?: string
  isPaid?: boolean
  startDate?: Date
  endDate?: Date
}

export interface ISubscriptionDAO {
  create(data: CreateSubscriptionData): Promise<Subscription>
  findById(id: string): Promise<Subscription | null>
  findAllByBankAccount(bankAccountId: string): Promise<Subscription[]>
  update(id: string, data: UpdateSubscriptionData): Promise<Subscription>
  delete(id: string): Promise<void>
}
