import { DailyTemplateController } from '../../../../controller/time-management.controller'
import { DailyTemplateService } from '../../../../service/daily-template.service'
import { DailyTemplateRepository } from '../../../../repository/daily-template.repository'

const repository = new DailyTemplateRepository()
const service = new DailyTemplateService(repository)
const controller = new DailyTemplateController(service)

defineRouteMeta({
  openAPI: {
    tags: ['Time Management - Daily Template'],
    summary: 'Get daily template by id',
    operationId: 'getDailyTemplateById',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Daily template found' },
      404: { description: 'Not found' }
    }
  } as any
})

export default defineEventHandler((event) =>
  controller.getById(event)
)