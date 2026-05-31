import type { Transaction } from '@prisma/client'
import type { ITransactionDAO, CreateTransactionData, UpdateTransactionData } from '../dao/transaction.dao'
import { prisma } from '../utils/prisma'

export class TransactionRepository implements ITransactionDAO {
  async create(data: CreateTransactionData): Promise<Transaction> {
    return prisma.transaction.create({ data })
  }

  async findById(id: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({ where: { id } })
  }

  async findAllByBankAccount(bankAccountId: string): Promise<Transaction[]> {
    return prisma.transaction.findMany({ where: { bankAccountId }, orderBy: { date: 'desc' } })
  }

  async update(id: string, data: UpdateTransactionData): Promise<Transaction> {
    return prisma.transaction.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({ where: { id } })
  }
}

export const transactionRepository = new TransactionRepository()
