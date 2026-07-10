import type {
  CreateDailyScheduleData,
  UpdateDailyScheduleData
} from '../dao/daily-schedule.dao'
import { prisma } from '../utils/prisma'


import type { IDailyScheduleDAO } from '../dao/daily-schedule.dao'

export class DailyScheduleRepository implements IDailyScheduleDAO {

  async create(data: CreateDailyScheduleData) {
    return await prisma.dailySchedule.create({data})
  }

  async findByUserIdAndDate(userId: string, date: Date) {
    return prisma.dailySchedule.findFirst({
      where: {
        userId,
        date,
      },
    })
  }

  async findById(id: string) {
    return prisma.dailySchedule.findUnique({
      where: { id },
      include: {
        blocks: {
          orderBy: { position: 'asc' },
        },
      },
    })
  }

  async findByUser(userId: string) {
    return prisma.dailySchedule.findMany({
      where: { userId },
      include: {
        blocks: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    })
  }

  async findByDate(
    userId: string,
    date: Date
  ) {
    return prisma.dailySchedule.findFirst({
      where: {
        userId,
        date,
      },
      include: {
        blocks: {
          orderBy: { position: 'asc' },
        },
      },
    })
  }

  async update(
    id: string,
    data: UpdateDailyScheduleData
  ) {
    return await prisma.dailySchedule.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await prisma.dailySchedule.deleteMany({
      where: { id }
    })

    return deleted.count > 0
  }
}