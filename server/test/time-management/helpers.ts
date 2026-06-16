import { prisma } from '../../utils/prisma'
import { $fetch } from '@nuxt/test-utils/e2e'

/* =========================
   TEST DATA (FIXED)
========================= */

export const testTimeBlock = {
  title: 'Study Session',
  description: 'Math revision',
  startTime: '10:00',
  endTime: '11:00',
  duration: 60,
  category: 'STUDY',
  priority: 'MEDIUM',
  position: 0,
  isCompleted: false,
  isLocked: false,
  repeatType: 'ONCE',
}

export const testDailyTemplate = {
  name: 'Morning Routine',
  description: 'Daily structure',
  isActive: true,
}

export const testDailySchedule = {
  date: new Date(),
}

/* =========================
   CLEAN DATABASE
========================= */

export async function clearTimeManagementData() {
  await prisma.timeBlock.deleteMany()
  await prisma.dailySchedule.deleteMany()
  await prisma.dailyTemplate.deleteMany()
}

/* =========================
   DB HELPERS (UNIT TEST)
========================= */

export async function createUserForTimeManagement(userId: string) {
  // juste pour assurer existence si besoin
  return prisma.user.findUnique({
    where: { id: userId },
  })
}

export async function createTimeBlock(userId: string, overrides: any = {}) {
  return prisma.timeBlock.create({
    data: {
      ...testTimeBlock,
      userId,
      ...overrides,
    },
  })
}

export async function createDailyTemplate(userId: string, overrides: any = {}) {
  return prisma.dailyTemplate.create({
    data: {
      ...testDailyTemplate,
      userId,
      ...overrides,
    },
  })
}

export async function createDailySchedule(
  userId: string,
  templateId?: string,
  overrides: any = {}
) {
  return prisma.dailySchedule.create({
    data: {
      ...testDailySchedule,
      userId,
      templateId,
      ...overrides,
    },
  })
}

/* =========================
   API HELPERS (E2E TEST)
========================= */

export async function createTimeBlockAPI(token: string, overrides: any = {}) {
  return $fetch('/api/time-management/time-blocks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      ...testTimeBlock,
      ...overrides,
    },
  })
}

export async function createDailyTemplateAPI(token: string, overrides: any = {}) {
  return $fetch('/api/time-management/daily-templates', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      ...testDailyTemplate,
      ...overrides,
    },
  })
}

export async function createDailyScheduleAPI(token: string, overrides: any = {}) {
  return $fetch('/api/time-management/daily-schedules', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      ...testDailySchedule,
      ...overrides,
    },
  })
}