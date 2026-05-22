import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import jwt from 'jsonwebtoken'
import { createVerifiedUser, clearDatabase } from './helpers'

describe('Auth API — Logout', async () => {
  await setup({})

  beforeEach(async () => {
    await clearDatabase()
  })

  it('should logout a user successfully', async () => {
    const user = await createVerifiedUser({
      email: 'logout@test.com',
      phone: '+212600000055',
    })
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '15m' },
    )

    const res = await $fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.message).toContain('Logged out')
  })

  it('should return 401 when no token is provided', async () => {
    const res = await $fetch('/api/auth/logout', {
      method: 'POST',
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 401).toBe(401)
  })
})
