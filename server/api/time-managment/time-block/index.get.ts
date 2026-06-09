import { TimeBlockController } from '../../../controller/time-management.controller'
import { TimeBlockService } from '../../../service/time-block.service'
import { TimeBlockRepository } from '../../../repository/time-block.repository'

const repository = new TimeBlockRepository()
const service = new TimeBlockService(repository)
const controller = new TimeBlockController(service)


defineRouteMeta({
  openAPI: {
    tags: ['Time Management - Time Block'],
    summary: 'Get user time blocks',
    operationId: 'getUserTimeBlocks',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'List of time blocks' },
      401: { description: 'Authentication required' }
    }
  }
})

export default defineEventHandler((event) =>
  controller.getByUser(event)
)