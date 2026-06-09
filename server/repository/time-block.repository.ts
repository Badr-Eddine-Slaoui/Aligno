import type {
  CreateTimeBlockData,
  UpdateTimeBlockData
} from '../dao/time-block.dao'
import { prisma } from '../utils/prisma'

import type { ITimeBlockDAO } from '../dao/time-block.dao'

export class TimeBlockRepository implements ITimeBlockDAO {

  async create(data: CreateTimeBlockData) {
    return prisma.timeBlock.create({ data })
  }

  async findById(id: string) {
    return prisma.timeBlock.findUnique({ where: { id } })
  }

  async findByUser(userId: string) {
    return prisma.timeBlock.findMany({ where: { userId } })
  }

  async findBySchedule(scheduleId: string) {
    return prisma.timeBlock.findMany({ where: { scheduleId } })
  }

  async findByTemplate(templateId: string) {
    return prisma.timeBlock.findMany({ where: { templateId } })
  }

  async update(
    id: string,
    data: UpdateTimeBlockData
  ) {
    return prisma.timeBlock.update({ where: { id }, data })
  }

  async delete(id: string) {
    return prisma.timeBlock.delete({ where: { id } })
  }
}