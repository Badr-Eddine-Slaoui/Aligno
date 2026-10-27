import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import jwt from 'jsonwebtoken'
import { validUser, buildFormData, createVerifiedUser, clearDatabase } from './helpers'

describe('Auth API — Guest Middleware Protection', async () => {
  await setup({})

  beforeEach(async () => {
    await clearDatabase()
  })

  it('should block authenticated users from accessing login guest route', async () => {
    const user = await createVerifiedUser({
      email: 'authenticated@guest.com',
      phone: '+212600000000',
    })
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '15m' },
    )

    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { email: 'authenticated@guest.com', password: validUser.password },
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 403).toBe(403)
  })

  it('should block authenticated users from accessing register guest route', async () => {
    const user = await createVerifiedUser({
      email: 'authenticated2@guest.com',
      phone: '+212600000001',
    })
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '15m' },
    )

    const res = await $fetch('/api/auth/register', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: buildFormData(validUser),
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 403).toBe(403)
  })
})
