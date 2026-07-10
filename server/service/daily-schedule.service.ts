import { DailyScheduleMapper } from '../mapper/time-management.mapper'
import type { CreateDailyScheduleDTO } from '../dto/time-management.dto'
import type { UpdateDailyScheduleDTO } from '../dto/time-management.dto'
import { DailyScheduleRepository } from '../repository/daily-schedule.repository'
    

export class DailyScheduleService {
  constructor(
    private readonly repository: DailyScheduleRepository
  ) {}

  async create(
    dto: CreateDailyScheduleDTO,
    userId: string
  ) {
    const data =
      DailyScheduleMapper.toCreateData(
        dto,
        userId
      )

    const { prisma } = await import('../utils/prisma')
    
    // Find if a schedule already exists for today (matching YYYY-MM-DD)
    const dateStr = new Date(dto.date).toISOString().split('T')[0] ?? ''
    
    return prisma.$transaction(async (tx) => {
      // Find existing schedule on that date
      const existing = await tx.dailySchedule.findFirst({
        where: {
          userId,
          date: {
            gte: new Date(`${dateStr}T00:00:00.000Z`),
            lte: new Date(`${dateStr}T23:59:59.999Z`),
          },
        },
      })

      if (existing) {
        // Delete all blocks linked to the existing schedule
        await tx.timeBlock.deleteMany({
          where: { scheduleId: existing.id },
        })
        // Delete the schedule itself
        await tx.dailySchedule.delete({
          where: { id: existing.id },
        })
      }

      const schedule = await tx.dailySchedule.create({
        data,
      })

      if (dto.templateId) {
        // Fetch blocks belonging to the template
        const templateBlocks = await tx.timeBlock.findMany({
          where: { templateId: dto.templateId },
        })

        if (templateBlocks.length > 0) {
          const newBlocks = templateBlocks.map((b) => ({
            title: b.title,
            description: b.description,
            startTime: b.startTime,
            endTime: b.endTime,
            duration: b.duration,
            category: b.category,
            priority: b.priority,
            position: b.position,
            repeatType: b.repeatType,
            repeatDays: b.repeatDays,
            repeatEnd: b.repeatEnd,
            scheduleId: schedule.id,
            userId,
          }))

          await tx.timeBlock.createMany({
            data: newBlocks,
          })
        }
      }

      return tx.dailySchedule.findUnique({
        where: { id: schedule.id },
        include: {
          blocks: {
            orderBy: { position: 'asc' },
          },
        },
      })
    })
  }

  async getById(id: string) {
    return this.repository.findById(id)
  }

  async getByUser(userId: string) {
    return this.repository.findByUser(userId)
  }

  async getByDate(
    userId: string,
    date: Date
  ) {
    return this.repository.findByDate(
      userId,
      date
    )
  }

  async update(
    id: string,
    dto: UpdateDailyScheduleDTO
  ) {
    return this.repository.update(id, dto)
  }

  async delete(id: string) {
    return this.repository.delete(id)
  }
}