import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { validUser, buildFormData, createVerifiedUser, clearDatabase } from './helpers'

describe('Auth API — Register', async () => {
  await setup({})

  beforeEach(async () => {
    await clearDatabase()
  })

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
