import { TimeBlockController } from '../../../../controller/time-management.controller'
import { TimeBlockService } from '../../../../service/time-block.service'
import { TimeBlockRepository } from '../../../../repository/time-block.repository'

const repository = new TimeBlockRepository()
const service = new TimeBlockService(repository)
const controller = new TimeBlockController(service)

defineRouteMeta({
  openAPI: {
    tags: ['Time Management - Time Block'],
    summary: 'Get time block by id',
    operationId: 'getTimeBlockById',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Time block found' },
      404: { description: 'Not found' }
    }
  }
})

export default defineEventHandler((event) =>
    controller.getById(event)
)