import type { H3Event } from 'h3'
import { readBody, getRouterParam, createError } from 'h3'

import { createTimeBlockSchema } from '../validations/time-management/index'

import type {
  CreateTimeBlockDTO,
  UpdateTimeBlockDTO,
  CreateDailyTemplateDTO,
  UpdateDailyTemplateDTO,
  CreateDailyScheduleDTO,
  UpdateDailyScheduleDTO
} from '../dto/time-management.dto'

import type { TimeBlockService } from '../service/time-block.service'
import type { DailyTemplateService } from '../service/daily-template.service'
import type { DailyScheduleService } from '../service/daily-schedule.service'

export class TimeBlockController {
  constructor(
    private readonly timeBlockService: TimeBlockService
  ) {}

  async create(event: H3Event) {
    const body = await readBody(event)

    const dto = createTimeBlockSchema.parse(body)

    const userId = event.context.auth?.userId

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    return await this.timeBlockService.create(dto, userId)
  }

  async getById(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

    return await this.timeBlockService.getById(id)
  }

  async getByUser(event: H3Event) {
    const userId = event.context.auth?.userId

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    return await this.timeBlockService.getByUser(userId)
  }

  async getBySchedule(event: H3Event) {
    const scheduleId = getRouterParam(event, 'scheduleId')
    if (!scheduleId) throw createError({ statusCode: 400 })

    return await this.timeBlockService.getBySchedule(scheduleId)
  }

  async getByTemplate(event: H3Event) {
    const templateId = getRouterParam(event, 'templateId')
    if (!templateId) throw createError({ statusCode: 400 })

    return await this.timeBlockService.getByTemplate(templateId)
  }

  async update(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400 })

    const body = await readBody(event)

    return await this.timeBlockService.update(
      id,
      body as UpdateTimeBlockDTO
    )
  }

  async delete(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400 })

    return await this.timeBlockService.delete(id)
  }
}

export class DailyTemplateController {
  constructor(
    private readonly dailyTemplateService: DailyTemplateService
  ) {}

  async create(event: H3Event) {
    const body = await readBody(event)

    const userId = event.context.auth?.userId

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    return await this.dailyTemplateService.create(
      body as CreateDailyTemplateDTO,
      userId
    )
  }

  async getById(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400 })

    return await this.dailyTemplateService.getById(id)
  }

  async getByUser(event: H3Event) {
    const userId = event.context.auth?.userId

    if (!userId) {
      throw createError({ statusCode: 401 })
    }

    return await this.dailyTemplateService.getByUser(userId)
  }

  async getActive(event: H3Event) {
    const userId = event.context.auth?.userId

    if (!userId) {
      throw createError({ statusCode: 401 })
    }

    return await this.dailyTemplateService.getActive(userId)
  }

  async update(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400 })

    const body = await readBody(event)

    return await this.dailyTemplateService.update(
      id,
      body as UpdateDailyTemplateDTO
    )
  }

  async delete(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400 })

    return await this.dailyTemplateService.delete(id)
  }
}

export class DailyScheduleController {
  constructor(
    private readonly dailyScheduleService: DailyScheduleService
  ) {}

  async create(event: H3Event) {
    const body = await readBody(event)

    const userId = event.context.auth?.userId

    if (!userId) {
      throw createError({
        statusCode: 401
      })
    }

    return await this.dailyScheduleService.create(
      body as CreateDailyScheduleDTO,
      userId
    )
  }

  async getById(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400 })

    return await this.dailyScheduleService.getById(id)
  }

  async getByUser(event: H3Event) {
    const userId = event.context.auth?.userId

    if (!userId) {
      throw createError({ statusCode: 401 })
    }

    return await this.dailyScheduleService.getByUser(userId)
  }

  async getByDate(event: H3Event) {
    const userId = event.context.auth?.userId
    const date = getRouterParam(event, 'date')

    if (!userId || !date) {
      throw createError({ statusCode: 400 })
    }

    return await this.dailyScheduleService.getByDate(
      userId,
      new Date(date)
    )
  }

  async update(event: H3Event) {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) throw createError({ statusCode: 400 })

    return await this.dailyScheduleService.update(
      id,
      body as UpdateDailyScheduleDTO
    )
  }

  async delete(event: H3Event) {
    const id = getRouterParam(event, 'id')

    if (!id) throw createError({ statusCode: 400 })

    return await this.dailyScheduleService.delete(id)
  }
}