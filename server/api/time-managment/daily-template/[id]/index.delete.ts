import { DailyTemplateController } from '../../../../controller/time-management.controller'
import { DailyTemplateService } from '../../../../service/daily-template.service'
import { DailyTemplateRepository } from '../../../../repository/daily-template.repository'

const repository = new DailyTemplateRepository()
const service = new DailyTemplateService(repository)
const controller = new DailyTemplateController(service)

defineRouteMeta({
  openAPI: {
    tags: ['Time Management - Daily Template'],
    summary: 'Delete daily template',
    operationId: 'deleteDailyTemplate',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Deleted successfully' },
      401: { description: 'Authentication required' }
    }
  } as any
})

export default defineEventHandler((event) =>
    controller.delete(event)
)