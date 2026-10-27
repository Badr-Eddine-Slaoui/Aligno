import type { CreateTransactionDto, UpdateTransactionDto, TransactionResponseDto } from '../dto/wallet.dto'
import { transactionRepository } from '../repository/transaction.repository'
import { bankAccountRepository } from '../repository/bankAccount.repository'
import { prisma } from '../utils/prisma'
import { logger } from '../utils/logger'

function balanceDelta(status: 'INCOME' | 'EXPENSE', amount: number): number {
  return status === 'INCOME' ? amount : -amount
}

export class TransactionService {
  private async assertOwnership(userId: string, bankAccountId: string) {
    const account = await bankAccountRepository.findById(bankAccountId)
    if (!account || account.userId !== userId) {
      throw createError({ statusCode: 404, statusMessage: 'Bank account not found' })
    }
  }

  async create(userId: string, dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    await this.assertOwnership(userId, dto.bankAccountId)
    logger.info(`Creating transaction for user: ${userId}`)

    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          ...dto,
          date: dto.date ? new Date(dto.date) : undefined,
        },
      })
      await bankAccountRepository.updateBalance(
        dto.bankAccountId,
        balanceDelta(dto.status, dto.amount),
        tx,
      )
      return transaction
    })
  }

  async getAll(userId: string, bankAccountId: string): Promise<TransactionResponseDto[]> {
    await this.assertOwnership(userId, bankAccountId)
    return transactionRepository.findAllByBankAccount(bankAccountId)
  }

  async getOne(userId: string, id: string): Promise<TransactionResponseDto> {
    const tx = await transactionRepository.findById(id)
    if (!tx) throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
    await this.assertOwnership(userId, tx.bankAccountId)
    return tx
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto): Promise<TransactionResponseDto> {
    const existing = await transactionRepository.findById(id)
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
    await this.assertOwnership(userId, existing.bankAccountId)

    // Compute balance correction: reverse old effect, apply new effect
    const oldDelta = balanceDelta(existing.status as 'INCOME' | 'EXPENSE', existing.amount)
    const newStatus = (dto.status ?? existing.status) as 'INCOME' | 'EXPENSE'
    const newAmount = dto.amount ?? existing.amount
    const newDelta = balanceDelta(newStatus, newAmount)
    const correction = newDelta - oldDelta

    return prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          ...dto,
          date: dto.date ? new Date(dto.date) : undefined,
        },
      })
      if (correction !== 0) {
        await bankAccountRepository.updateBalance(existing.bankAccountId, correction, tx)
      }
      return updated
    })
  }

  async delete(userId: string, id: string): Promise<void> {
    const tx = await transactionRepository.findById(id)
    if (!tx) throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
    await this.assertOwnership(userId, tx.bankAccountId)

    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.transaction.delete({ where: { id } })
      await bankAccountRepository.updateBalance(
        tx.bankAccountId,
        -balanceDelta(tx.status as 'INCOME' | 'EXPENSE', tx.amount),
        prismaTx,
      )
    })
    logger.info(`Transaction ${id} deleted by user ${userId}`)
  }
}

export const transactionService = new TransactionService()
