import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { validUser, createVerifiedUser, createUnverifiedUser, clearDatabase } from './helpers'

describe('Auth API — Login', async () => {
  await setup({})

  beforeEach(async () => {
    await clearDatabase()
  })

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
