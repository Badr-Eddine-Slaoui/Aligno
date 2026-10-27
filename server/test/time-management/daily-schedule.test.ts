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
      headers: { Authorization: `Bearer ${token}` },
      body: { date: new Date(), templateId },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data).toBeDefined()
    expect((res as any).data.templateId).toBe(templateId)
  })

  it('should get schedules', async () => {
    const res = await $fetch('/api/time-management/daily-schedule', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect((res as any).success).toBe(true)
    expect(Array.isArray((res as any).data)).toBe(true)
  })

  it('should get schedule by id, update it, and delete it', async () => {
    const created = await createDailyScheduleAPI(token, { templateId })
    const id = (created as any).data.id

    const got = await $fetch(`/api/time-management/daily-schedule/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((got as any).success).toBe(true)
    expect((got as any).data.id).toBe(id)

    const updated = await $fetch(`/api/time-management/daily-schedule/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { templateId: null },
    })
    expect((updated as any).success).toBe(true)

    const deleted = await $fetch(`/api/time-management/daily-schedule/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect((deleted as any).success).toBe(true)
  })

  it('should prevent unauthorized requests', async () => {
    const res = await $fetch('/api/time-management/daily-schedule', {
      method: 'POST',
      body: { date: new Date() },
      ignoreResponseError: true,
    })
    expect((res as any).statusCode).toBe(401)
  })
})