import type { BankAccount } from '@prisma/client'
import type { IBankAccountDAO, CreateBankAccountData, UpdateBankAccountData } from '../dao/bankAccount.dao'
import { prisma } from '../utils/prisma'

export class BankAccountRepository implements IBankAccountDAO {
  async create(data: CreateBankAccountData): Promise<BankAccount> {
    return prisma.bankAccount.create({ data })
  }

  async findById(id: string): Promise<BankAccount | null> {
    return prisma.bankAccount.findUnique({ where: { id } })
  }

  async findAllByUser(userId: string): Promise<BankAccount[]> {
    return prisma.bankAccount.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  }

  async findByAccountNumber(accountNumber: string): Promise<BankAccount | null> {
    return prisma.bankAccount.findUnique({ where: { accountNumber } })
  }

  async update(id: string, data: UpdateBankAccountData): Promise<BankAccount> {
    return prisma.bankAccount.update({ where: { id }, data })
  }

  async updateBalance(id: string, delta: number, tx = prisma): Promise<BankAccount> {
    return tx.bankAccount.update({
      where: { id },
      data: { balance: { increment: delta } },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.bankAccount.delete({ where: { id } })
  }
}

export const bankAccountRepository = new BankAccountRepository()
