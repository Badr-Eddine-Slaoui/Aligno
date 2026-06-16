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
    })
  }

  async findByUser(userId: string) {
    return prisma.dailySchedule.findMany({
      where: { userId },
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

  async delete(id: string) {
    await prisma.dailySchedule.delete({
      where: { id },
    })
  }
}