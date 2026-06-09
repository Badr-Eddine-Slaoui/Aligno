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

    return this.repository.create(data)
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