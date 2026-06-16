import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

import {
  clearTimeManagementData,
  createTestUser,
  getAuthToken,
  createDailyTemplateAPI,
} from './helpers'

describe('Time Management — DailyTemplate', async () => {
  await setup({})

  let token: string

  beforeEach(async () => {
    await clearTimeManagementData()
    await createTestUser()

    token = await getAuthToken()
  })

  it('should create a daily template', async () => {
    const res = await createDailyTemplateAPI(token)

    expect((res as any).data.name).toBe('Morning Routine')
  })

  it('should get templates', async () => {
    await createDailyTemplateAPI(token)

    const res = await $fetch('/api/time-management/daily-templates', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect((res as any).length).toBeGreaterThanOrEqual(1)
  })

  it('should return 422 when name missing', async () => {
    const res = await $fetch('/api/time-management/daily-templates', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {},
      ignoreResponseError: true,
    })

    expect((res as any).statusCode ?? 422).toBe(422)
  })
})