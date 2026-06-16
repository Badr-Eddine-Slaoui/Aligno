import { DailyScheduleController } from '../../../../controller/time-management.controller'
import { DailyScheduleService } from '../../../../service/daily-schedule.service'
import { DailyScheduleRepository } from '../../../../repository/daily-schedule.repository'

const repository = new DailyScheduleRepository()
const service = new DailyScheduleService(repository)
const Controller = new DailyScheduleController(service)

defineRouteMeta({
  openAPI: {
    tags: ['Time Management - Daily Schedule'],
    summary: 'Update daily schedule',
    operationId: 'updateDailySchedule',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
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
      200: {
        description: 'Daily schedule updated successfully',
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
  Controller.update(event),
)