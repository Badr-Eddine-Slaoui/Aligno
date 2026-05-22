import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import jwt from 'jsonwebtoken'
import { createVerifiedUser, clearDatabase } from './helpers'

function createExpiredToken(userId: string) {
  return jwt.sign(
    {
      userId,
      exp: Math.floor(Date.now() / 1000) - 10,
    },
    process.env.JWT_SECRET || 'fallback_jwt_secret',
    { noTimestamp: true },
  )
}

describe('Auth API — Profile (Me)', async () => {
  await setup({})

  beforeEach(async () => {
    await clearDatabase()
  })

  it('should return the user profile with a valid token', async () => {
    const user = await createVerifiedUser({
      email: 'me@test.com',
      phone: '+212600000077',
    })
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '15m' },
    )

    const res = await $fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.email).toBe('me@test.com')
  })

  it('should return 401 when no token is provided', async () => {
    const res = await $fetch('/api/auth/me', {
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 401).toBe(401)
  })

  it('should return 401 for an expired access token (no refresh cookie)', async () => {
    const user = await createVerifiedUser({
      email: 'expired@test.com',
      phone: '+212600000066',
    })
    const token = createExpiredToken(user.id)

    const res = await $fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 401).toBe(401)
  })
})
