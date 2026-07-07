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

  it('should get template by id, update it, and delete it', async () => {
    const created = await $fetch('/api/time-management/daily-template', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        name: 'Gym Routine',
        isActive: false,
      },
    })
    const id = (created as any).data.id

    const got = await $fetch(`/api/time-management/daily-template/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    expect((got as any).success).toBe(true)
    expect((got as any).data.name).toBe('Gym Routine')

    const updated = await $fetch(`/api/time-management/daily-template/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        name: 'Heavy Lift Routine',
        isActive: true,
      },
    })
    expect((updated as any).success).toBe(true)
    expect((updated as any).data.name).toBe('Heavy Lift Routine')
    expect((updated as any).data.isActive).toBe(true)

    const deleted = await $fetch(`/api/time-management/daily-template/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    expect((deleted as any).success).toBe(true)
  })

  it('should prevent unauthorized requests', async () => {
    const res = await $fetch('/api/time-management/daily-template', {
      method: 'POST',
      body: { name: 'Unauthorized' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode).toBe(401)
  })
})