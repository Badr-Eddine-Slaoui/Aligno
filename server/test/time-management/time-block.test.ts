import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import {
  clearTimeManagementData,
  createTestUser,
  getAuthToken
} from './helpers'
import { prisma } from '../../utils/prisma'

describe('Time Management — TimeBlock API', async () => {
  await setup({})

  let token: string
  let user: any
  let timeBlockId: string

  beforeEach(async () => {
    await clearTimeManagementData()
    user = await createTestUser()
    token = await getAuthToken()

    // sanity check
    expect(user.email).toBeDefined()
  })

  it('should create a time block', async () => {
    const res = await $fetch('/api/time-management/time-block', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        title: "Study Session",
        description: "string",
        startTime: "09:00",
        endTime: "10:30",
        duration: 1,
        category: "WORK",
        priority: "LOW",
        position: 0,
        repeatType: "NONE",
        repeatDays: "string",
        repeatEnd: "2026-06-23T22:11:49.490Z"
      },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.title).toBe('Study Session')

    timeBlockId = (res as any).data.id
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.length).toBeGreaterThan(0)
  })

  it('should return 422 for invalid data', async () => {
    const res = await $fetch('/api/time-management/time-block', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        title: '', // invalid
      },
      ignoreResponseError: true,
    })

    console.log('Response:', res) // Log the response for debugging
    console.log('Response Body:', (res as any).body)
    console.log('Response Status:', (res as any).statusCode)

    expect((res as any).statusCode).toBe(422)
  })
})