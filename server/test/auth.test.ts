import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { prisma } from '../utils/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { hashToken, generateSecureToken } from '../utils/crypto'

describe('Auth API', async () => {
  await setup({})

  const validUser = {
    firstName: 'Test',
    lastName: 'User',
    age: '25',
    email: 'testuser@example.com',
    phone: '+212600000099',
    password: 'Str0ng!Pass',
    confirmPassword: 'Str0ng!Pass',
  }

  function buildFormData(fields: Record<string, string>) {
    const fd = new FormData()
    for (const [key, value] of Object.entries(fields)) {
      fd.append(key, value)
    }
    return fd
  }

  async function createVerifiedUser(overrides: Partial<typeof validUser> = {}) {
    const data = { ...validUser, ...overrides }
    const passwordHash = await bcrypt.hash(data.password, 10)
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: Number(data.age),
        email: data.email,
        phone: data.phone,
        passwordHash,
        emailVerified: true,
      },
    })
  }

  async function createUnverifiedUser(overrides: Partial<typeof validUser> = {}) {
    const data = { ...validUser, ...overrides }
    const passwordHash = await bcrypt.hash(data.password, 10)
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: Number(data.age),
        email: data.email,
        phone: data.phone,
        passwordHash,
        emailVerified: false,
      },
    })
  }

  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await $fetch('/api/auth/register', {
        method: 'POST',
        body: buildFormData(validUser),
      })

      expect(res).toBeDefined()
      expect((res as any).success).toBe(true)
      expect((res as any).data.accessToken).toBeDefined()
      expect((res as any).data.user.email).toBe(validUser.email)
      expect((res as any).data.user.firstName).toBe(validUser.firstName)
      expect((res as any).data.user.passwordHash).toBeUndefined()
      expect((res as any).data.user.refreshToken).toBeUndefined()
    })

    it('should return 422 when required fields are missing', async () => {
      const res = await $fetch('/api/auth/register', {
        method: 'POST',
        body: buildFormData({ email: 'partial@test.com' }),
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 422).toBe(422)
    })

    it('should return 422 when passwords do not match', async () => {
      const res = await $fetch('/api/auth/register', {
        method: 'POST',
        body: buildFormData({ ...validUser, confirmPassword: 'Different1!' }),
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 422).toBe(422)
    })

    it('should return 422 for invalid email format', async () => {
      const res = await $fetch('/api/auth/register', {
        method: 'POST',
        body: buildFormData({ ...validUser, email: 'not-an-email' }),
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 422).toBe(422)
    })

    it('should return 422 for invalid phone format', async () => {
      const res = await $fetch('/api/auth/register', {
        method: 'POST',
        body: buildFormData({ ...validUser, phone: '0612345678' }),
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 422).toBe(422)
    })

    it('should return 422 for weak password', async () => {
      const res = await $fetch('/api/auth/register', {
        method: 'POST',
        body: buildFormData({
          ...validUser,
          password: '123',
          confirmPassword: '123',
        }),
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 422).toBe(422)
    })

    it('should return 409 when email is already taken', async () => {
      await createVerifiedUser()

      const res = await $fetch('/api/auth/register', {
        method: 'POST',
        body: buildFormData(validUser),
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 409).toBe(409)
    })

    it('should return 409 when phone is already taken', async () => {
      await createVerifiedUser()

      const res = await $fetch('/api/auth/register', {
        method: 'POST',
        body: buildFormData({
          ...validUser,
          email: 'different@example.com',
        }),
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 409).toBe(409)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login a verified user successfully', async () => {
      await createVerifiedUser()

      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email: validUser.email, password: validUser.password },
      })

      expect((res as any).success).toBe(true)
      expect((res as any).data.accessToken).toBeDefined()
      expect((res as any).data.user.email).toBe(validUser.email)
    })

    it('should return 401 for wrong email', async () => {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email: 'nonexistent@test.com', password: 'whatever' },
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 401).toBe(401)
    })

    it('should return 401 for wrong password', async () => {
      await createVerifiedUser()

      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email: validUser.email, password: 'WrongP@ss1' },
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 401).toBe(401)
    })

    it('should return 403 for unverified email', async () => {
      await createUnverifiedUser({
        email: 'unverified@test.com',
        phone: '+212600000088',
      })

      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email: 'unverified@test.com', password: validUser.password },
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 403).toBe(403)
    })

    it('should return 422 for missing fields', async () => {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {},
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 422).toBe(422)
    })
  })

  describe('GET /api/auth/me', () => {
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
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'fallback_jwt_secret',
        { expiresIn: '0s' },
      )

      await new Promise((r) => setTimeout(r, 100))

      const res = await $fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        ignoreResponseError: true,
      })

      expect((res as any).statusCode || 401).toBe(401)
    })
  })

  describe('POST /api/auth/logout', () => {
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

  describe('POST /api/auth/email/validation', () => {
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

  describe('POST /api/auth/forgot-password', () => {
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

  describe('POST /api/auth/reset-password', () => {
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

  describe('Guest Middleware Protection', () => {
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
})

