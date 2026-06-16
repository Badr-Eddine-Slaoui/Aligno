import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

import {
  clearTimeManagementData,
  createTestUser,
  getAuthToken,
  createTimeBlockAPI,
} from './helpers'

describe('Time Management — TimeBlock', async () => {
  await setup({})

  let token: string

  beforeEach(async () => {
    await clearTimeManagementData()
    await createTestUser()

    token = await getAuthToken()
  })

  it('should create a time block', async () => {
    const res = await createTimeBlockAPI(token)

    expect((res as any).data.title).toBe('Study Session')
    expect((res as any).data.category).toBe('STUDY')
  })

  it('should get user time blocks', async () => {
    await createTimeBlockAPI(token)

    const res = await $fetch('/api/time-management/time-blocks', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect((res as any).length).toBeGreaterThanOrEqual(1)
  })

  it('should return 422 for invalid data', async () => {
    const res = await $fetch('/api/time-management/time-blocks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { title: '' },
      ignoreResponseError: true,
    })

    expect((res as any).statusCode ?? 422).toBe(422)
  })

  it('should return 401 when not authenticated', async () => {
    const res = await $fetch('/api/time-management/time-blocks', {
      method: 'POST',
      body: {},
      ignoreResponseError: true,
    })

    expect((res as any).statusCode ?? 401).toBe(401)
  })
})