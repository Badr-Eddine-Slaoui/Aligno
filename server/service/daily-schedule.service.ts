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

    // Run in a prisma transaction to ensure atomic schedule creation & block copying
    const { prisma } = await import('../utils/prisma')
    
    return prisma.$transaction(async (tx) => {
      const schedule = await tx.dailySchedule.create({
        data,
      })

      if (dto.templateId) {
        // Fetch blocks belonging to the template
        const templateBlocks = await tx.timeBlock.findMany({
          where: { templateId: dto.templateId },
        })

        if (templateBlocks.length > 0) {
          // Map them to today's schedule blocks (excluding their unique IDs and templates IDs)
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

      // Return the schedule with the copied blocks
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