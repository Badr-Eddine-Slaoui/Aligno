import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import {
  clearTimeManagementData,
  createTestUser,
  getAuthToken
} from './helpers'

describe('Time Management — DailyTemplate API', async () => {
  await setup({})

  let token: string
  let user: any

  beforeEach(async () => {
    await clearTimeManagementData()
    user = await createTestUser()
    token = await getAuthToken()
  })

  it('should create a daily template', async () => {
    const res = await $fetch('/api/time-management/daily-template', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        name: 'Morning Routine',
        isActive: true,
      },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.name).toBe('Morning Routine')
  })

  it('should get templates', async () => {
    const res = await $fetch('/api/time-management/daily-template', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect((res as any).success).toBe(true)
    expect(Array.isArray((res as any).data)).toBe(true)
  })
})