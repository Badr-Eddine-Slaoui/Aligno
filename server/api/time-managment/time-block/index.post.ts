import { createTimeBlockSchema } from '../../../validations/time-management/index';

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const dto = createTimeBlockSchema.parse(body)

  const userId = event.context.user.id

  return await timeBlockController.create(
    dto,
    userId
  )
})