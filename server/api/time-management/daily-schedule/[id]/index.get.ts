import { DailyScheduleController } from '../../../../controller/time-management.controller'
import { DailyScheduleService } from '../../../../service/daily-schedule.service'
import { DailyScheduleRepository } from '../../../../repository/daily-schedule.repository'

const repository = new DailyScheduleRepository()
const service = new DailyScheduleService(repository)
const Controller = new DailyScheduleController(service)

defineRouteMeta({
  openAPI: {
    tags: ['Time Management - Daily Schedule'],
    summary: 'Get daily schedule by ID',
    operationId: 'getDailyScheduleById',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Daily schedule retrieved successfully',
      },
      404: {
        description: 'Daily schedule not found',
      },
      401: {
        description: 'Authentication required',
      },
    },
  } as any,
})

export default defineEventHandler((event) =>
  Controller.getById(event),
)