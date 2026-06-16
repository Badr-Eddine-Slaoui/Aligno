import { TimeBlockController } from '../../../../controller/time-management.controller'
import { TimeBlockService } from '../../../../service/time-block.service'
import { TimeBlockRepository } from '../../../../repository/time-block.repository'

const repository = new TimeBlockRepository()
const service = new TimeBlockService(repository)
const timeBlockController = new TimeBlockController(service)


defineRouteMeta({
  openAPI: {
    tags: ['Time Management - Time Block'],
    summary: 'Update time block',
    operationId: 'updateTimeBlock',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Updated successfully' },
      422: { description: 'Validation failed' }
    }
  }
})

export default defineEventHandler((event) =>
  timeBlockController.update(event)
)