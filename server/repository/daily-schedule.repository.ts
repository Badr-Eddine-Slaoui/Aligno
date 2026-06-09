import type {
  CreateDailyScheduleData,
  UpdateDailyScheduleData
} from '../dao/daily-schedule.dao'

import type { IDailyScheduleDAO } from '../dao/daily-schedule.dao'

export class DailyScheduleRepository {
  constructor(
    private readonly dailyScheduleDAO: IDailyScheduleDAO
  ) {}

  async create(data: CreateDailyScheduleData) {
    return this.dailyScheduleDAO.create(data)
  }

  async findById(id: string) {
    return this.dailyScheduleDAO.findById(id)
  }

  async findByUser(userId: string) {
    return this.dailyScheduleDAO.findByUserIdAndDate(userId, new Date())
  }

  async findByDate(
    userId: string,
    date: Date
  ) {
    return this.dailyScheduleDAO.findByDate(
      userId,
      date
    )
  }

  async update(
    id: string,
    data: UpdateDailyScheduleData
  ) {
    return this.dailyScheduleDAO.update(id, data)
  }

  async delete(id: string) {
    return this.dailyScheduleDAO.delete(id)
  }
}