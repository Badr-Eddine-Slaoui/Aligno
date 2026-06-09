import type {
  CreateDailyTemplateData,
  UpdateDailyTemplateData
} from '../dao/daily-template.dao'

import type { IDailyTemplateDAO } from '../dao/daily-template.dao'

export class DailyTemplateRepository {
  constructor(
    private readonly dailyTemplateDAO: IDailyTemplateDAO
  ) {}

  async create(data: CreateDailyTemplateData) {
    return this.dailyTemplateDAO.create(data)
  }

  async findById(id: string) {
    return this.dailyTemplateDAO.findById(id)
  }

  async findByUser(userId: string) {
    return this.dailyTemplateDAO.findByUserId(userId)
  }

  async findActive(userId: string) {
    return this.dailyTemplateDAO.findActive(userId)
  }

  async update(
    id: string,
    data: UpdateDailyTemplateData
  ) {
    return this.dailyTemplateDAO.update(id, data)
  }

  async delete(id: string) {
    return this.dailyTemplateDAO.delete(id)
  }
}