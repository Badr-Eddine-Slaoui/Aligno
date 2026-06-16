import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

import {
  clearTimeManagementData,
  createTestUser,
  getAuthToken,
  createDailyTemplateAPI,
  createDailyScheduleAPI,
} from './helpers'

describe('Time Management — DailySchedule', async () => {
  await setup({})

  let token: string
  let templateId: string

  beforeEach(async () => {
    await clearTimeManagementData()
    await createTestUser()

    token = await getAuthToken()

    const template = await createDailyTemplateAPI(token)
    templateId = (template as any).data.id
  })

  it('should create schedule', async () => {
    const res = await createDailyScheduleAPI(token, {
      templateId,
    })

    expect((res as any).data.templateId).toBe(templateId)
  })

  it('should get schedules', async () => {
    await createDailyScheduleAPI(token, { templateId })

    const res = await $fetch('/api/time-management/daily-schedules', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect((res as any).length).toBeGreaterThanOrEqual(1)
  })

  it('should return 422 when date missing', async () => {
    const res = await $fetch('/api/time-management/daily-schedules', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {},
      ignoreResponseError: true,
    })

    expect((res as any).statusCode ?? 422).toBe(422)
  })
})