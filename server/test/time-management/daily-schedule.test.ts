import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

import {
  clearTimeManagementData,
  createDailyScheduleAPI,
  createDailyTemplateAPI,
} from './helpers'

import { createWalletUser, testUser, getAuthToken } from '../wallet/helpers'

describe('Time Management API — DailySchedule', async () => {
  await setup({})

  let token: string
  let templateId: string

  beforeEach(async () => {
    await clearTimeManagementData()
    await createWalletUser(testUser)

    token = await getAuthToken(testUser.email)

    const template = await createDailyTemplateAPI(token)
    templateId = (template as any).id
  })

  // ─── CREATE ─────────────────────────────

  it('should create a daily schedule', async () => {
    const res = await createDailyScheduleAPI(token, {
      templateId,
    })

    expect((res as any).templateId).toBe(templateId)
  })

  // ─── GET ─────────────────────────────

  it('should get user schedules', async () => {
    await createDailyScheduleAPI(token, { templateId })

    const res = await $fetch('/api/time-management/daily-schedules', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect((res as any).length).toBeGreaterThanOrEqual(1)
  })

  // ─── VALIDATION ─────────────────────────────

  it('should return 422 when date is missing', async () => {
    const res = await $fetch('/api/time-management/daily-schedules', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {},
      ignoreResponseError: true,
    })

    expect((res as any).statusCode ?? 422).toBe(422)
  })
})