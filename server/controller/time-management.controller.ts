import type {
  CreateTimeBlockDTO,
  UpdateTimeBlockDTO
} from '../dto/time-management.dto'

import type { TimeBlockService } from '../service/time-block.service'

import type {
  CreateDailyTemplateDTO,
  UpdateDailyTemplateDTO
} from '../dto/time-management.dto'

import type { DailyTemplateService } from '../service/daily-template.service'

 import type {
  CreateDailyScheduleDTO,
  UpdateDailyScheduleDTO
} from '../dto/time-management.dto'

import type { DailyScheduleService } from '../service/daily-schedule.service'

export class TimeBlockController {
  constructor(
    private readonly timeBlockService: TimeBlockService
  ) {}

  async create(
    dto: CreateTimeBlockDTO,
    userId: string
  ) {
    return await this.timeBlockService.create(
      dto,
      userId
    )
  }

  async getById(id: string) {
    return await this.timeBlockService.getById(id)
  }

  async getByUser(userId: string) {
    return await this.timeBlockService.getByUser(userId)
  }

  async getBySchedule(scheduleId: string) {
    return await this.timeBlockService.getBySchedule(
      scheduleId
    )
  }

  async getByTemplate(templateId: string) {
    return await this.timeBlockService.getByTemplate(
      templateId
    )
  }

  async update(
    id: string,
    dto: UpdateTimeBlockDTO
  ) {
    return await this.timeBlockService.update(
      id,
      dto
    )
  }

  async delete(id: string) {
    return await this.timeBlockService.delete(id)
  }
}

export class DailyTemplateController {
  constructor(
    private readonly dailyTemplateService: DailyTemplateService
  ) {}

  async create(
    dto: CreateDailyTemplateDTO,
    userId: string
  ) {
    return await this.dailyTemplateService.create(
      dto,
      userId
    )
  }

  async getById(id: string) {
    return await this.dailyTemplateService.getById(id)
  }

  async getByUser(userId: string) {
    return await this.dailyTemplateService.getByUser(
      userId
    )
  }

  async getActive(userId: string) {
    return await this.dailyTemplateService.getActive(
      userId
    )
  }

  async update(
    id: string,
    dto: UpdateDailyTemplateDTO
  ) {
    return await this.dailyTemplateService.update(
      id,
      dto
    )
  }

  async delete(id: string) {
    return await this.dailyTemplateService.delete(id)
  }
}


export class DailyScheduleController {
  constructor(
    private readonly dailyScheduleService: DailyScheduleService
  ) {}

  async create(
    dto: CreateDailyScheduleDTO,
    userId: string
  ) {
    return await this.dailyScheduleService.create(
      dto,
      userId
    )
  }

  async getById(id: string) {
    return await this.dailyScheduleService.getById(id)
  }

  async getByUser(userId: string) {
    return await this.dailyScheduleService.getByUser(
      userId
    )
  }

  async getByDate(
    userId: string,
    date: Date
  ) {
    return await this.dailyScheduleService.getByDate(
      userId,
      date
    )
  }

  async update(
    id: string,
    dto: UpdateDailyScheduleDTO
  ) {
    return await this.dailyScheduleService.update(
      id,
      dto
    )
  }

  async delete(id: string) {
    return await this.dailyScheduleService.delete(id)
  }
}