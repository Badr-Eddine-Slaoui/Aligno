import type { CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionResponseDto } from '../dto/wallet.dto'
import { subscriptionRepository } from '../repository/subscription.repository'
import { bankAccountRepository } from '../repository/bankAccount.repository'
import { logger } from '../utils/logger'

export class SubscriptionService {
  private async assertOwnership(userId: string, bankAccountId: string) {
    const account = await bankAccountRepository.findById(bankAccountId)
    if (!account || account.userId !== userId) {
      throw createError({ statusCode: 404, statusMessage: 'Bank account not found' })
    }
  }

  async create(userId: string, dto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    await this.assertOwnership(userId, dto.bankAccountId)
    logger.info(`Creating subscription for user: ${userId}`)
    return subscriptionRepository.create({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    })
  }

  async getAll(userId: string, bankAccountId: string): Promise<SubscriptionResponseDto[]> {
    await this.assertOwnership(userId, bankAccountId)
    return subscriptionRepository.findAllByBankAccount(bankAccountId)
  }

  async getOne(userId: string, id: string): Promise<SubscriptionResponseDto> {
    const sub = await subscriptionRepository.findById(id)
    if (!sub) throw createError({ statusCode: 404, statusMessage: 'Subscription not found' })
    await this.assertOwnership(userId, sub.bankAccountId)
    return sub
  }

  async update(userId: string, id: string, dto: UpdateSubscriptionDto): Promise<SubscriptionResponseDto> {
    const sub = await subscriptionRepository.findById(id)
    if (!sub) throw createError({ statusCode: 404, statusMessage: 'Subscription not found' })
    await this.assertOwnership(userId, sub.bankAccountId)
    return subscriptionRepository.update(id, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    })
  }

  async delete(userId: string, id: string): Promise<void> {
    const sub = await subscriptionRepository.findById(id)
    if (!sub) throw createError({ statusCode: 404, statusMessage: 'Subscription not found' })
    await this.assertOwnership(userId, sub.bankAccountId)
    await subscriptionRepository.delete(id)
    logger.info(`Subscription ${id} deleted by user ${userId}`)
  }
}

export const subscriptionService = new SubscriptionService()
