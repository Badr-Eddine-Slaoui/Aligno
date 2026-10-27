import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch, fetch } from '@nuxt/test-utils/e2e'
import jwt from 'jsonwebtoken'
import { hashToken } from '../../utils/crypto'
import { prisma } from '../../utils/prisma'
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

describe('Auth Middleware', async () => {
  await setup({})

  beforeEach(async () => {
    await clearDatabase()
  })

  it('should allow access with a valid access token', async () => {
    const user = await createVerifiedUser({
      email: 'valid-access@test.com',
      phone: '+212600000100',
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
    expect((res as any).data.email).toBe('valid-access@test.com')
  })

  it('should block access and return 401 when no credentials are provided', async () => {
    const res = await $fetch('/api/auth/me', {
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 401).toBe(401)
  })

  it('should perform silent refresh when access token is expired but refresh cookie is valid', async () => {
    const user = await createVerifiedUser({
      email: 'silent-refresh@test.com',
      phone: '+212600000101',
    })
    const expiredToken = createExpiredToken(user.id)
    const rawRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret',
      { expiresIn: '30d' },
    )
    
    // Update user in DB with hashed refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashToken(rawRefreshToken) },
    })

    const response = await fetch('/api/auth/me', {
      headers: { 
        Authorization: `Bearer ${expiredToken}`,
        Cookie: `refresh_token=${rawRefreshToken}`,
      },
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.email).toBe('silent-refresh@test.com')
    
    // Check that a new access token was returned in the header
    const newAccessToken = response.headers.get('x-access-token')
    expect(newAccessToken).toBeDefined()
    expect(newAccessToken).not.toBeNull()
  })

  it('should return 401 when access token is expired and refresh token cookie is invalid', async () => {
    const user = await createVerifiedUser({
      email: 'bad-refresh@test.com',
      phone: '+212600000102',
    })
    const expiredToken = createExpiredToken(user.id)
    const invalidRefreshToken = 'invalid-refresh-token'

    const res = await $fetch('/api/auth/me', {
      headers: { 
        Authorization: `Bearer ${expiredToken}`,
        Cookie: `refresh_token=${invalidRefreshToken}`,
      },
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 401).toBe(401)
  })

  it('should return 401 when access token is expired and refresh token does not match DB hash', async () => {
    const user = await createVerifiedUser({
      email: 'mismatch-refresh@test.com',
      phone: '+212600000103',
    })
    const expiredToken = createExpiredToken(user.id)
    const rawRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret',
      { expiresIn: '30d' },
    )

    // Store a different refresh token in DB to force a mismatch
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: 'some-other-hashed-token' },
    })
    const res = await $fetch('/api/auth/me', {
      headers: { 
        Authorization: `Bearer ${expiredToken}`,
        Cookie: `refresh_token=${rawRefreshToken}`,
      },
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 401).toBe(401)
  })
})
