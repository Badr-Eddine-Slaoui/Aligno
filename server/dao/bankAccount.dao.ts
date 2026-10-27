import type { BankAccount } from '@prisma/client'

export interface CreateBankAccountData {
  name: string
  bankName?: string
  accountNumber?: string
  balance?: number
  currency?: string
  userId: string
}

export interface UpdateBankAccountData {
  name?: string
  bankName?: string
  accountNumber?: string
  balance?: number
  currency?: string
}

export interface IBankAccountDAO {
  create(data: CreateBankAccountData): Promise<BankAccount>
  findById(id: string): Promise<BankAccount | null>
  findAllByUser(userId: string): Promise<BankAccount[]>
  findByAccountNumber(accountNumber: string): Promise<BankAccount | null>
  update(id: string, data: UpdateBankAccountData): Promise<BankAccount>
  updateBalance(id: string, delta: number, tx?: any): Promise<BankAccount>
  delete(id: string): Promise<void>
}
