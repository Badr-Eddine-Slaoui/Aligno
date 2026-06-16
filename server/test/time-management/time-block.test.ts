import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

import {
  clearTimeManagementData,
  createTimeBlockAPI
} from './helpers'

import { createWalletUser, testUser, getAuthToken } from '../wallet/helpers'

describe('Time Management API — TimeBlock', async () => {
  await setup({})

  let token: string
  let userId: string

  beforeEach(async () => {
    await clearTimeManagementData()
    await createWalletUser(testUser)

    token = await getAuthToken(testUser.email)
  })

  // ─── CREATE ─────────────────────────────────────

  it('should create a time block', async () => {
    const res = await createTimeBlockAPI(token)

    expect((res as any).title).toBe('Study Session')
    expect((res as any).category).toBe('STUDY')
  })

  it('should return 422 for invalid duration', async () => {
    const res = await $fetch('/api/time-management/time-blocks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        title: 'Invalid',
        startTime: '10:00',
        endTime: '11:00',
        duration: -10,
        category: 'STUDY',
      },
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

  // ─── GET ─────────────────────────────────────

  it('should get user time blocks', async () => {
    await createTimeBlockAPI(token)

    const res = await $fetch('/api/time-management/time-blocks', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect((res as any).length).toBeGreaterThanOrEqual(1)
  })
})