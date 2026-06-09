import { TimeBlockController } from '../../../../controller/time-management.controller'
import { TimeBlockService } from '../../../../service/time-block.service'
import { TimeBlockRepository } from '../../../../repository/time-block.repository'

const repository = new TimeBlockRepository()
const service = new TimeBlockService(repository)
const controller = new TimeBlockController(service)

defineRouteMeta({
  openAPI: {
    tags: ['Time Management - Time Block'],
    summary: 'Delete time block',
    operationId: 'deleteTimeBlock',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Deleted successfully' }
    }
  }
})

export default defineEventHandler((event) =>
  controller.delete(event)
)