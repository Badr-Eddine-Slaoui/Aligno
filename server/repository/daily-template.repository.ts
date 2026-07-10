import type {
  CreateDailyTemplateData,
  UpdateDailyTemplateData
} from '../dao/daily-template.dao'
import { prisma } from '../utils/prisma'

import type { IDailyTemplateDAO } from '../dao/daily-template.dao'

export class DailyTemplateRepository implements IDailyTemplateDAO {

  async create(data: CreateDailyTemplateData) {
    return prisma.dailyTemplate.create({ data })
  }

  async findById(id: string) {
    return prisma.dailyTemplate.findUnique({
      where: { id },
      include: {
        timeBlocks: {
          orderBy: { position: 'asc' },
        },
      },
    })
  }

  async findByUserId(userId: string) {
    return prisma.dailyTemplate.findMany({
      where: { userId },
      include: {
        _count: { select: { timeBlocks: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findActive(userId: string) {
    return prisma.dailyTemplate.findFirst({ where: { userId, isActive: true } })
  }

  async update(
    id: string,
    data: UpdateDailyTemplateData
  ) {
    return prisma.dailyTemplate.update({ where: { id }, data })
  }

  async delete(id: string) {
    await prisma.dailyTemplate.delete({ where: { id } })
  }
}