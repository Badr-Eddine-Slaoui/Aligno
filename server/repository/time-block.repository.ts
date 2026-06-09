import type {
  CreateTimeBlockData,
  UpdateTimeBlockData
} from '../dao/time-block.dao'

import type { ITimeBlockDAO } from '../dao/time-block.dao'

export class TimeBlockRepository {
  constructor(
    private readonly timeBlockDAO: ITimeBlockDAO
  ) {}

  async create(data: CreateTimeBlockData) {
    return this.timeBlockDAO.create(data)
  }

  async findById(id: string) {
    return this.timeBlockDAO.findById(id)
  }

  async findByUser(userId: string) {
    return this.timeBlockDAO.findByUserId(userId)
  }

  async findBySchedule(scheduleId: string) {
    return this.timeBlockDAO.findBySchedule(scheduleId)
  }

  async findByTemplate(templateId: string) {
    return this.timeBlockDAO.findByTemplate(templateId)
  }

  async update(
    id: string,
    data: UpdateTimeBlockData
  ) {
    return this.timeBlockDAO.update(id, data)
  }

  async delete(id: string) {
    return this.timeBlockDAO.delete(id)
  }
}