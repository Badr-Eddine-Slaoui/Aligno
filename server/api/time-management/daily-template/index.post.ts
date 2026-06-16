import { DailyTemplateController } from '../../../controller/time-management.controller'
import { DailyTemplateService } from '../../../service/daily-template.service'
import { DailyTemplateRepository } from '../../../repository/daily-template.repository'

const repository = new DailyTemplateRepository()
const service = new DailyTemplateService(repository)
const controller = new DailyTemplateController(service)


defineRouteMeta({
  openAPI: {
    tags: ['Time Management - Daily Template'],
    summary: 'Create a daily template',
    operationId: 'createDailyTemplate',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 100 },
              description: { type: 'string', maxLength: 500 },
              isActive: { type: 'boolean' }
            }
          }
        }
      }
    },
    responses: {
      201: { description: 'Daily template created successfully' },
      422: { description: 'Validation failed' },
      401: { description: 'Authentication required' }
    }
  } as any
})

export default defineEventHandler((event) =>
   controller.create(event)
)