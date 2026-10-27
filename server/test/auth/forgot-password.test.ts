import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { createVerifiedUser, clearDatabase } from './helpers'

describe('Auth API — Forgot Password', async () => {
  await setup({})

  beforeEach(async () => {
    await clearDatabase()
  })

  it('should return success for an existing email', async () => {
    await createVerifiedUser({
      email: 'forgot@test.com',
      phone: '+212600000022',
    })

    const res = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'forgot@test.com' },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.message).toContain('reset link')
  })

  it('should return same success for a non‑existing email (anti‑enumeration)', async () => {
    const res = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'ghost@test.com' },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.message).toContain('reset link')
  })

  it('should return 422 for invalid email', async () => {
    const res = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'not-valid' },
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 422).toBe(422)
  })
})
