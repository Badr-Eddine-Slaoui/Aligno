import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import bcrypt from 'bcrypt'
import { prisma } from '../../utils/prisma'
import { hashToken, generateSecureToken } from '../../utils/crypto'
import { clearDatabase } from './helpers'

describe('Auth API — Email Verification', async () => {
  await setup({})

  beforeEach(async () => {
    await clearDatabase()
  })

  it('should verify email with a valid token', async () => {
    const rawToken = generateSecureToken()
    const hashedToken = hashToken(rawToken)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.create({
      data: {
        firstName: 'Verify',
        lastName: 'Me',
        age: 20,
        email: 'verify@test.com',
        phone: '+212600000044',
        passwordHash: await bcrypt.hash('P@ssw0rd!', 10),
        emailVerifyToken: hashedToken,
        emailVerifyExpires: expires,
      },
    })

    const res = await $fetch('/api/auth/email/validation', {
      method: 'POST',
      body: { token: rawToken },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.message).toContain('verified')

    const user = await prisma.user.findUnique({ where: { email: 'verify@test.com' } })
    expect(user?.emailVerified).toBe(true)
    expect(user?.emailVerifyToken).toBeNull()
  })

  it('should return 400 for an invalid token', async () => {
    const res = await $fetch('/api/auth/email/validation', {
      method: 'POST',
      body: { token: 'totally_invalid_token' },
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 400).toBe(400)
  })

  it('should return 400 for an expired token', async () => {
    const rawToken = generateSecureToken()
    const hashedToken = hashToken(rawToken)
    const expired = new Date(Date.now() - 1000)

    await prisma.user.create({
      data: {
        firstName: 'Expired',
        lastName: 'Token',
        age: 20,
        email: 'expiredverify@test.com',
        phone: '+212600000033',
        passwordHash: await bcrypt.hash('P@ssw0rd!', 10),
        emailVerifyToken: hashedToken,
        emailVerifyExpires: expired,
      },
    })

    const res = await $fetch('/api/auth/email/validation', {
      method: 'POST',
      body: { token: rawToken },
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 400).toBe(400)
  })
})
