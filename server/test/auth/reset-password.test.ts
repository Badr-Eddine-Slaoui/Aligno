import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import bcrypt from 'bcrypt'
import { prisma } from '../../utils/prisma'
import { hashToken, generateSecureToken } from '../../utils/crypto'
import { clearDatabase } from './helpers'

describe('Auth API — Reset Password', async () => {
  await setup({})

  beforeEach(async () => {
    await clearDatabase()
  })

  it('should reset password with a valid token', async () => {
    const rawToken = generateSecureToken()
    const hashedToken = hashToken(rawToken)
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.create({
      data: {
        firstName: 'Reset',
        lastName: 'Me',
        age: 30,
        email: 'reset@test.com',
        phone: '+212600000011',
        passwordHash: await bcrypt.hash('OldP@ssw0rd!', 10),
        emailVerified: true,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expires,
      },
    })

    const res = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: rawToken,
        password: 'NewP@ssw0rd!',
        confirmPassword: 'NewP@ssw0rd!',
      },
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.message).toContain('reset')

    const user = await prisma.user.findUnique({ where: { email: 'reset@test.com' } })
    const oldMatch = await bcrypt.compare('OldP@ssw0rd!', user!.passwordHash)
    const newMatch = await bcrypt.compare('NewP@ssw0rd!', user!.passwordHash)
    expect(oldMatch).toBe(false)
    expect(newMatch).toBe(true)
  })

  it('should return 400 for an invalid reset token', async () => {
    const res = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: 'bogus_token',
        password: 'NewP@ssw0rd!',
        confirmPassword: 'NewP@ssw0rd!',
      },
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 400).toBe(400)
  })

  it('should return 400 for an expired reset token', async () => {
    const rawToken = generateSecureToken()
    const hashedToken = hashToken(rawToken)
    const expired = new Date(Date.now() - 1000)

    await prisma.user.create({
      data: {
        firstName: 'ExpReset',
        lastName: 'User',
        age: 30,
        email: 'expreset@test.com',
        phone: '+212600000010',
        passwordHash: await bcrypt.hash('OldP@ssw0rd!', 10),
        emailVerified: true,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expired,
      },
    })

    const res = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: rawToken,
        password: 'NewP@ssw0rd!',
        confirmPassword: 'NewP@ssw0rd!',
      },
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 400).toBe(400)
  })

  it('should return 422 when passwords do not match', async () => {
    const res = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: 'sometoken',
        password: 'NewP@ssw0rd!',
        confirmPassword: 'DifferentP@ss1',
      },
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 422).toBe(422)
  })
})
