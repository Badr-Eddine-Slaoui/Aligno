import { TimeBlockController } from '../../../controller/time-management.controller'
import { TimeBlockService } from '../../../service/time-block.service'
import { TimeBlockRepository } from '../../../repository/time-block.repository'

const repository = new TimeBlockRepository()
const service = new TimeBlockService(repository)
const timeBlockController = new TimeBlockController(service)

defineRouteMeta({
  openAPI: {
    tags: ['Time Management - Time Block'],
    summary: 'Create a time block',
    operationId: 'createTimeBlock',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['title', 'startTime', 'endTime', 'duration', 'category'],
            properties: {
              title: { type: 'string', minLength: 3, maxLength: 100 },
              description: { type: 'string' },

              startTime: { type: 'string', example: '09:00' },
              endTime: { type: 'string', example: '10:30' },

              duration: { type: 'number', minimum: 1 },

              category: {
                type: 'string',
                enum: ['WORK', 'STUDY', 'HEALTH', 'BREAK', 'PERSONAL', 'MEETING', 'OTHER']
              },

              priority: {
                type: 'string',
                enum: ['LOW', 'MEDIUM', 'HIGH']
              },

              position: { type: 'number' },

              repeatType: {
                type: 'string',
                enum: ['NONE', 'ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']
              },

              repeatDays: { type: 'string' },
              repeatEnd: { type: 'string', format: 'date-time' },

              templateId: { type: 'string' },
              scheduleId: { type: 'string' }
            }
          }
        }
      }
    },
    responses: {
      201: { description: 'Time block created successfully' },
      422: { description: 'Validation failed' },
      401: { description: 'Authentication required' }
    }
  } as any
})

export default defineEventHandler((event) =>
  timeBlockController.create(event)
)