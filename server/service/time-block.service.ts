import type {
  CreateTimeBlockDTO,
  UpdateTimeBlockDTO
} from '../dto/time-management.dto'

import { TimeBlockMapper } from '../mapper/time-management.mapper'
import { TimeBlockRepository } from '../repository/time-block.repository'

export class TimeBlockService {
  constructor(
    private readonly repository: TimeBlockRepository
  ) {}

  async create(
    dto: CreateTimeBlockDTO,
    userId: string
  ) {
    const data =
      TimeBlockMapper.toCreateData(
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
  async getBySchedule(scheduleId: string) {
    return this.repository.findBySchedule(scheduleId)
  }

  async getByTemplate(templateId: string) {
    return this.repository.findByTemplate(templateId)
  }

  async update(
    id: string,
    dto: UpdateTimeBlockDTO
  ) {
    const data =
      TimeBlockMapper.toUpdateData(dto)

    return this.repository.update(id, data)
  }

  async delete(id: string) {
    return this.repository.delete(id)
  }
}