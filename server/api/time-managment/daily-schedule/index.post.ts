import { DailyScheduleController } from '../../../controller/time-management.controller'
import { DailyScheduleService } from '../../../service/daily-schedule.service'
import { DailyScheduleRepository } from '../../../repository/daily-schedule.repository'

const repository = new DailyScheduleRepository()
const service = new DailyScheduleService(repository)
const Controller = new DailyScheduleController(service)

defineRouteMeta({
  openAPI: {
    tags: ['Time Management - Daily Schedule'],
    summary: 'Create a daily schedule',
    operationId: 'createDailySchedule',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['date'],
            properties: {
              date: {
                type: 'string',
                format: 'date-time',
              },
              templateId: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Daily schedule created successfully',
      },
      422: {
        description: 'Validation failed',
      },
      401: {
        description: 'Authentication required',
      },
    },
  } as any,
})

export default defineEventHandler((event) =>
  Controller.create(event),
)