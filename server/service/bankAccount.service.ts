import type { CreateBankAccountDto, UpdateBankAccountDto, BankAccountResponseDto } from '../dto/wallet.dto'
import { bankAccountRepository } from '../repository/bankAccount.repository'
import { logger } from '../utils/logger'

export class BankAccountService {
  async create(userId: string, dto: CreateBankAccountDto): Promise<BankAccountResponseDto> {
    logger.info(`Creating bank account for user: ${userId}`)

    if (dto.accountNumber) {
      const existing = await bankAccountRepository.findByAccountNumber(dto.accountNumber)
      if (existing) {
        throw createError({ statusCode: 409, statusMessage: 'Account number already in use' })
      }
    }

    return bankAccountRepository.create({ ...dto, userId })
  }

  async getAll(userId: string): Promise<BankAccountResponseDto[]> {
    return bankAccountRepository.findAllByUser(userId)
  }

  async getOne(userId: string, id: string): Promise<BankAccountResponseDto> {
    const account = await bankAccountRepository.findById(id)
    if (!account || account.userId !== userId) {
      throw createError({ statusCode: 404, statusMessage: 'Bank account not found' })
    }
    return account
  }

  async update(userId: string, id: string, dto: UpdateBankAccountDto): Promise<BankAccountResponseDto> {
    const account = await bankAccountRepository.findById(id)
    if (!account || account.userId !== userId) {
      throw createError({ statusCode: 404, statusMessage: 'Bank account not found' })
    }

    if (dto.accountNumber && dto.accountNumber !== account.accountNumber) {
      const existing = await bankAccountRepository.findByAccountNumber(dto.accountNumber)
      if (existing) {
        throw createError({ statusCode: 409, statusMessage: 'Account number already in use' })
      }
    }

    return bankAccountRepository.update(id, dto)
  }

  async delete(userId: string, id: string): Promise<void> {
    const account = await bankAccountRepository.findById(id)
    if (!account || account.userId !== userId) {
      throw createError({ statusCode: 404, statusMessage: 'Bank account not found' })
    }
    await bankAccountRepository.delete(id)
    logger.info(`Bank account ${id} deleted by user ${userId}`)
  }
}

export const bankAccountService = new BankAccountService()
