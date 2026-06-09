import { DailyTemplateMapper } from '../mapper/time-management.mapper'
import type { CreateDailyTemplateDTO } from '../dto/time-management.dto'
import type { UpdateDailyTemplateDTO } from '../dto/time-management.dto'
import { DailyTemplateRepository } from '../repository/daily-template.repository'

export class DailyTemplateService {
  constructor(
    private readonly repository: DailyTemplateRepository
  ) {}

  async create(
    dto: CreateDailyTemplateDTO,
    userId: string
  ) {
    const data =
      DailyTemplateMapper.toCreateData(
        dto,
        userId
      )

    return this.repository.create(data)
  }

  async getByUser(userId: string) {
    return this.repository.findByUser(userId)
  }

  async getActive(userId: string) {
    return this.repository.findActive(userId)
  }

  async getById(id: string) {
    return this.repository.findById(id)
  }

  async update(
    id: string,
    dto: UpdateDailyTemplateDTO
  ) {
    return this.repository.update(id, dto)
  }

  async delete(id: string) {
    return this.repository.delete(id)
  }
}