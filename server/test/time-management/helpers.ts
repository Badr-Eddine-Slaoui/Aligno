import bcrypt from 'bcrypt'
import { prisma } from '../../utils/prisma'
import { $fetch } from '@nuxt/test-utils/e2e'

/* ─────────────────────────────
   TEST USER
───────────────────────────── */

export const testUser = {
  firstName: 'Time',
  lastName: 'Tester',
  age: 25,
  email: 'time.test@example.com',
  phone: '+212600000099',
  password: 'SuperSecurePassword123!',
}

/* ─────────────────────────────
   CLEAN TIME MANAGEMENT DATA
───────────────────────────── */

export async function clearTimeManagementData() {
  await prisma.timeBlock.deleteMany({})
  await prisma.dailySchedule.deleteMany({})
  await prisma.dailyTemplate.deleteMany({})
  await prisma.user.deleteMany({})
}

/* ─────────────────────────────
   CREATE TEST USER
───────────────────────────── */

export async function createTestUser() {
  const hashedPassword = await bcrypt.hash(testUser.password, 10)

  const user = await prisma.user.create({
    data: {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      age: testUser.age,
      email: testUser.email,
      phone: testUser.phone,
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  })

  return user
}

/* ─────────────────────────────
   AUTH TOKEN
───────────────────────────── */

export async function getAuthToken() {
  const res = await $fetch('/api/auth/login', {
    method: 'POST',
    body: {
      email: testUser.email,
      password: testUser.password,
    },
  })

  return (res as any).data.accessToken as string
}

/* ─────────────────────────────
   DAILY TEMPLATE API
───────────────────────────── */

export async function createDailyTemplateAPI(token: string, overrides: any = {}) {
  return await $fetch('/api/time-management/daily-template', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      name: 'Morning Routine',
      isActive: true,
      ...overrides,
    },
  })
}

/* ─────────────────────────────
   DAILY SCHEDULE API
───────────────────────────── */

export async function createDailyScheduleAPI(token: string, overrides: any = {}) {
  return await $fetch('/api/time-management/daily-schedule', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      date: new Date(),
      ...overrides,
    },
  })
}

/* ─────────────────────────────
   TIME BLOCK API
───────────────────────────── */

export async function createTimeBlockAPI(token: string, overrides: any = {}) {
  return await $fetch('/api/time-management/time-block', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      title: 'Study Session',
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      category: 'STUDY',
      ...overrides,
    },
  })
}