import type { Subscription } from '@prisma/client'
import type { ISubscriptionDAO, CreateSubscriptionData, UpdateSubscriptionData } from '../dao/subscription.dao'
import { prisma } from '../utils/prisma'

export class SubscriptionRepository implements ISubscriptionDAO {
  async create(data: CreateSubscriptionData): Promise<Subscription> {
    return prisma.subscription.create({ data })
  }

  async findById(id: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({ where: { id } })
  }

  async findAllByBankAccount(bankAccountId: string): Promise<Subscription[]> {
    return prisma.subscription.findMany({ where: { bankAccountId }, orderBy: { createdAt: 'desc' } })
  }

  async update(id: string, data: UpdateSubscriptionData): Promise<Subscription> {
    return prisma.subscription.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.subscription.delete({ where: { id } })
  }
}

export const subscriptionRepository = new SubscriptionRepository()
