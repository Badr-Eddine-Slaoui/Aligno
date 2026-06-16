import { prisma } from '../../utils/prisma'
import { $fetch } from '@nuxt/test-utils/e2e'
import bcrypt from 'bcrypt'

/* ─────────────────────────────
   TEST USER (ONLY FOR TIME MGMT)
───────────────────────────── */

export const testUser = {
  firstName: 'Time',
  lastName: 'Tester',
  age: 25,
  email: 'time.test@example.com',
  phone: '+212600000099',
  password: 'TestPassword123!',
}

/* ─────────────────────────────
   CLEAN DATABASE (ONLY TIME MGMT)
───────────────────────────── */

export async function clearTimeManagementData() {
  await prisma.timeBlock.deleteMany()
  await prisma.dailySchedule.deleteMany()
  await prisma.dailyTemplate.deleteMany()
  await prisma.user.deleteMany()
}

/* ─────────────────────────────
   CREATE USER (SAFE)
───────────────────────────── */

export async function createTestUser() {
  const passwordHash = await bcrypt.hash(testUser.password, 10)

  return prisma.user.upsert({
    where: { email: testUser.email },
    update: {},
    create: {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      age: testUser.age,
      email: testUser.email,
      phone: testUser.phone,
      passwordHash,
      emailVerified: true,
    },
  })
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

  return (res as any).data.accessToken
}

/* ─────────────────────────────
   TIME BLOCK API
───────────────────────────── */

export async function createTimeBlockAPI(token: string, overrides: any = {}) {
  return $fetch('/api/time-management/time-blocks', {
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

/* ─────────────────────────────
   DAILY TEMPLATE API
───────────────────────────── */

export async function createDailyTemplateAPI(token: string, overrides: any = {}) {
  return $fetch('/api/time-management/daily-templates', {
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
  return $fetch('/api/time-management/daily-schedules', {
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