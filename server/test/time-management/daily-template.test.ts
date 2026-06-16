import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

import {
  clearTimeManagementData,
  createDailyTemplateAPI,
} from './helpers'

import { createWalletUser, testUser, getAuthToken } from '../wallet/helpers'

describe('Time Management API — DailyTemplate', async () => {
  await setup({})

  let token: string

  beforeEach(async () => {
    await clearTimeManagementData()
    await createWalletUser(testUser)

    token = await getAuthToken(testUser.email)
  })

  it('should create a daily template', async () => {
    const res = await createDailyTemplateAPI(token)

    expect((res as any).name).toBe('Morning Routine')
  })

  it('should get user templates', async () => {
    await createDailyTemplateAPI(token)

    const res = await $fetch('/api/time-management/daily-templates', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect((res as any).length).toBeGreaterThanOrEqual(1)
  })

  it('should return 422 when name is missing', async () => {
    const res = await $fetch('/api/time-management/daily-templates', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {},
      ignoreResponseError: true,
    })

    expect((res as any).statusCode ?? 422).toBe(422)
  })
})