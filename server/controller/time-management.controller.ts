import { H3Event, readBody, getRouterParam, createError } from 'h3'
import { createTimeBlockSchema } from '../validations/time-management'

import type {
  CreateTimeBlockDTO,
  UpdateTimeBlockDTO,
  CreateDailyTemplateDTO,
  UpdateDailyTemplateDTO,
  CreateDailyScheduleDTO,
  UpdateDailyScheduleDTO,
} from '../dto/time-management.dto'

import type { TimeBlockService } from '../service/time-block.service'
import type { DailyTemplateService } from '../service/daily-template.service'
import type { DailyScheduleService } from '../service/daily-schedule.service'

const getUserId = (event: H3Event) => {
  return event.context.userId
}

/* ================= TIME BLOCK ================= */

export class TimeBlockController {
  constructor(private readonly service: TimeBlockService) {}

  async create(event: H3Event) {
    const body = await readBody(event)
    const dto = createTimeBlockSchema.safeParse(body)

    if (!dto.success) {
      throw createError({ statusCode: 422, message: 'Invalid input data' })
    }

    const userId = getUserId(event)
    if (!userId) throw createError({ statusCode: 401 })

    const result = await this.service.create(dto.data, userId)

    return { success: true, data: result }
  }

  async getByUser(event: H3Event) {
    const userId = getUserId(event)
    if (!userId) throw createError({ statusCode: 401 })

    const result = await this.service.getByUser(userId)

    return { success: true, data: result }
  }

  async getById(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    const result = await this.service.getById(id)

    return { success: true, data: result }
  }

  async update(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    const body = await readBody(event)

    const result = await this.service.update(id, body as UpdateTimeBlockDTO)

    return { success: true, data: result }
  }

  async delete(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    await this.service.delete(id)

    return { success: true, message: 'Deleted successfully' }
  }
}

/* ================= TEMPLATE ================= */

export class DailyTemplateController {
  constructor(private readonly service: DailyTemplateService) {}

  async create(event: H3Event) {
    const body = await readBody(event)
    const userId = getUserId(event)

    if (!userId) throw createError({ statusCode: 401 })

    const result = await this.service.create(body as CreateDailyTemplateDTO, userId)

    return { success: true, data: result }
  }

  async getByUser(event: H3Event) {
    const userId = getUserId(event)
    if (!userId) throw createError({ statusCode: 401 })

    const result = await this.service.getByUser(userId)

    return { success: true, data: result }
  }

  async getById(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    const result = await this.service.getById(id)
    if (!result) return { success: true, data: null }

    const { blocks, ...rest } = result as any
    return {
      success: true,
      data: {
        ...rest,
        timeBlocks: blocks || []
      }
    }
  }

  async update(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    const body = await readBody(event)

    const result = await this.service.update(id, body as UpdateDailyTemplateDTO)

    return { success: true, data: result }
  }

  async delete(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    await this.service.delete(id)

    return { success: true, message: 'Deleted successfully' }
  }
}

/* ================= SCHEDULE ================= */

export class DailyScheduleController {
  constructor(private readonly service: DailyScheduleService) {}

  async create(event: H3Event) {
    const body = await readBody(event)
    const userId = getUserId(event)

    if (!userId) throw createError({ statusCode: 401 })

    const result = await this.service.create(body as CreateDailyScheduleDTO, userId)

    return { success: true, data: result }
  }

  async getByUser(event: H3Event) {
    const userId = getUserId(event)
    if (!userId) throw createError({ statusCode: 401 })

    const result = await this.service.getByUser(userId)

    return { success: true, data: result }
  }

  async getById(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    const result = await this.service.getById(id)

    return { success: true, data: result }
  }

  async update(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    const body = await readBody(event)

    const result = await this.service.update(id, body as UpdateDailyScheduleDTO)

    return { success: true, data: result }
  }

  async delete(event: H3Event) {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    const deleted = await this.service.delete(id)

    if (!deleted) {
      throw createError({ statusCode: 404, message: 'Not found' })
    }

    return {
      success: true,
      message: 'Deleted successfully'
    }
}
}