import type { Budget } from '@prisma/client'

export interface CreateBudgetData {
  amount: number
  month: number
  year: number
  userId: string
}

export interface IBudgetDAO {
  upsert(data: CreateBudgetData): Promise<Budget>
  findByMonth(userId: string, month: number, year: number): Promise<Budget | null>
  findAllByUser(userId: string): Promise<Budget[]>
  delete(id: string): Promise<void>
}
