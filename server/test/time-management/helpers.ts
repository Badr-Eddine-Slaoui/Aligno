import { $fetch } from '@nuxt/test-utils/e2e'

const API = '/api'

/* TIME BLOCK */
export async function createTimeBlockAPI(token: string, overrides: any = {}) {
  return await $fetch(`${API}/time-management/time-blocks`, {
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

/* DAILY TEMPLATE */
export async function createDailyTemplateAPI(token: string, overrides: any = {}) {
  return await $fetch(`${API}/time-management/daily-templates`, {
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

/* DAILY SCHEDULE */
export async function createDailyScheduleAPI(token: string, overrides: any = {}) {
  return await $fetch(`${API}/time-management/daily-schedules`, {
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