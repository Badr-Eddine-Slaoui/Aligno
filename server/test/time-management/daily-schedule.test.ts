import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import {
  clearTimeManagementData,
  createTestUser,
  getAuthToken,
  createDailyTemplateAPI
} from './helpers'

describe('Time Management — DailySchedule API', async () => {
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
    const res = await $fetch('/api/time-management/daily-schedule', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        date: new Date(),
        templateId,
      },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data).toBeDefined()
  })

  it('should get schedules', async () => {
    const res = await $fetch('/api/time-management/daily-schedule', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect((res as any).success).toBe(true)
    expect(Array.isArray((res as any).data)).toBe(true)
  })
})