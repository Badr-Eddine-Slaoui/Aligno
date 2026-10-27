import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import {
  clearTimeManagementData,
  createTestUser,
  getAuthToken,
  createTimeBlockAPI,
} from './helpers'
import { prisma } from '../../utils/prisma'

describe('Time Management — TimeBlock API', async () => {
  await setup({})

  let token: string
  let user: any

  beforeEach(async () => {
    await clearTimeManagementData()
    user = await createTestUser()
    token = await getAuthToken()
    expect(user.email).toBeDefined()
  })

  it('should create a time block', async () => {
    const res = await $fetch('/api/time-management/time-block', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        title: 'Study Session',
        description: 'Deep focus block',
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        category: 'WORK',
        priority: 'LOW',
        position: 0,
        repeatType: 'NONE',
      },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.title).toBe('Study Session')
  })

  it('should get user time blocks', async () => {
    await prisma.timeBlock.create({
      data: {
        title: 'Study Session',
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        category: 'STUDY',
        userId: user.id,
      },
    })

    const res = await $fetch('/api/time-management/time-block', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.length).toBeGreaterThan(0)
  })

  it('should get by id, update, and delete a time block', async () => {
    const created = await createTimeBlockAPI(token)
    const id = (created as any).data.id

    const got = await $fetch(`/api/time-management/time-block/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((got as any).success).toBe(true)
    expect((got as any).data.id).toBe(id)

    const updated = await $fetch(`/api/time-management/time-block/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { title: 'Updated Block', priority: 'HIGH' },
    })
    expect((updated as any).success).toBe(true)
    expect((updated as any).data.title).toBe('Updated Block')
    expect((updated as any).data.priority).toBe('HIGH')

    const deleted = await $fetch(`/api/time-management/time-block/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((deleted as any).success).toBe(true)
  })

  it('should return 422 for invalid data', async () => {
    const res = await $fetch('/api/time-management/time-block', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { title: '' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode).toBe(422)
  })

  it('should prevent unauthorized requests', async () => {
    const res = await $fetch('/api/time-management/time-block', {
      method: 'POST',
      body: { title: 'Unauthorized' },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode).toBe(401)
  })
})