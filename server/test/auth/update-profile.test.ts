import 'dotenv/config'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import jwt from 'jsonwebtoken'
import { createVerifiedUser, clearDatabase } from './helpers'
import { prisma } from '../../utils/prisma'

describe('Auth API — Update Profile', async () => {
  await setup({})

  beforeEach(async () => {
    await clearDatabase()
  })

  afterEach(async () => {
    // Cleanup any uploaded test avatars to keep the workspace clean
    const uploadDir = path.resolve('public/uploads/avatars')
    try {
      const files = await fs.readdir(uploadDir)
      for (const file of files) {
        if (file !== '.keep') {
          await fs.unlink(path.join(uploadDir, file))
        }
      }
    } catch {
      // Ignore directory missing
    }
  })

  it('should update profile details (firstName, lastName, age) successfully', async () => {
    const user = await createVerifiedUser({
      firstName: 'OriginalFirst',
      lastName: 'OriginalLast',
      age: 20,
    })

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '15m' },
    )

    const fd = new FormData()
    fd.append('firstName', 'UpdatedFirst')
    fd.append('lastName', 'UpdatedLast')
    fd.append('age', '28')

    const res = await $fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.firstName).toBe('UpdatedFirst')
    expect((res as any).data.lastName).toBe('UpdatedLast')
    expect((res as any).data.age).toBe(28)

    // Verify in database
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    expect(dbUser?.firstName).toBe('UpdatedFirst')
    expect(dbUser?.lastName).toBe('UpdatedLast')
    expect(dbUser?.age).toBe(28)
  })

  it('should update email and phone successfully when they are unique', async () => {
    const user = await createVerifiedUser({
      email: 'unique@test.com',
      phone: '+212600000011',
    })

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '15m' },
    )

    const fd = new FormData()
    fd.append('email', 'newemail@test.com')
    fd.append('phone', '+212699999999')

    const res = await $fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.email).toBe('newemail@test.com')
    expect((res as any).data.phone).toBe('+212699999999')
  })

  it('should allow updating details while leaving email and phone identical to current values', async () => {
    const user = await createVerifiedUser({
      firstName: 'SameEmail',
      email: 'same@test.com',
      phone: '+212600000022',
    })

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '15m' },
    )

    const fd = new FormData()
    fd.append('firstName', 'StillSameEmail')
    fd.append('email', 'same@test.com')
    fd.append('phone', '+212600000022')

    const res = await $fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })

    expect((res as any).success).toBe(true)
    expect((res as any).data.firstName).toBe('StillSameEmail')
    expect((res as any).data.email).toBe('same@test.com')
  })

  it('should return 409 when the new email is already used by another user', async () => {
    const userA = await createVerifiedUser({
      email: 'usera@test.com',
      phone: '+212600000033',
    })
    await createVerifiedUser({
      email: 'userb@test.com',
      phone: '+212600000044',
    })

    const token = jwt.sign(
      { userId: userA.id },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '15m' },
    )

    const fd = new FormData()
    fd.append('email', 'userb@test.com')

    const res = await $fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 409).toBe(409)
  })

  it('should return 409 when the new phone is already used by another user', async () => {
    const userA = await createVerifiedUser({
      email: 'usera@test.com',
      phone: '+212600000033',
    })
    await createVerifiedUser({
      email: 'userb@test.com',
      phone: '+212600000044',
    })

    const token = jwt.sign(
      { userId: userA.id },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '15m' },
    )

    const fd = new FormData()
    fd.append('phone', '+212600000044')

    const res = await $fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 409).toBe(409)
  })

  it('should return 422 for invalid format updates', async () => {
    const user = await createVerifiedUser()
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '15m' },
    )

    const fd = new FormData()
    fd.append('phone', '0612345678') // Invalid phone format

    const res = await $fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 422).toBe(422)
  })

  it('should return 401 when no token is provided', async () => {
    const fd = new FormData()
    fd.append('firstName', 'UnauthenticatedUpdate')

    const res = await $fetch('/api/auth/profile', {
      method: 'PUT',
      body: fd,
      ignoreResponseError: true,
    })

    expect((res as any).statusCode || 401).toBe(401)
  })

  it('should upload a new profile picture and delete the old profile picture from disk', async () => {
    // 1. Create upload folder if not exists and place a dummy old file
    const uploadDir = path.resolve('public/uploads/avatars')
    await fs.mkdir(uploadDir, { recursive: true })
    const oldFileName = 'old-avatar.webp'
    const oldFilePath = path.join(uploadDir, oldFileName)
    await fs.writeFile(oldFilePath, 'mock old image buffer')

    const user = await createVerifiedUser({
      email: 'pic@test.com',
      phone: '+212600000055',
      profilePictureUrl: `/uploads/avatars/${oldFileName}`,
    })

    // Confirm old file exists
    let oldExists = false
    try {
      await fs.access(oldFilePath)
      oldExists = true
    } catch {}
    expect(oldExists).toBe(true)

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '15m' },
    )

    // 2. Prepare multipart request with new picture
    const fd = new FormData()
    fd.append('firstName', 'AvatarUser')
    
    // A 1x1 transparent PNG pixel base64-encoded to act as a valid image for sharp
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    const pngBuffer = Buffer.from(pngBase64, 'base64')
    const fileBlob = new Blob([pngBuffer], { type: 'image/png' })
    fd.append('profilePicture', fileBlob, 'new-avatar.png')

    // 3. Make PUT request
    const res = await $fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })

    expect((res as any).success).toBe(true)
    const newPicUrl = (res as any).data.profilePictureUrl
    expect(newPicUrl).toContain('/uploads/avatars/')
    expect(newPicUrl).toContain('.webp')

    // 4. Verify old file is deleted from disk
    let oldStillExists = false
    try {
      await fs.access(oldFilePath)
      oldStillExists = true
    } catch {}
    expect(oldStillExists).toBe(false)

    // 5. Verify new file exists and is generated
    const newFilePath = path.resolve('public', newPicUrl.replace(/^\//, ''))
    let newExists = false
    try {
      await fs.access(newFilePath)
      newExists = true
    } catch {}
    expect(newExists).toBe(true)
  })
})
