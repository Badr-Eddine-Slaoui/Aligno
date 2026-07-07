import { useTimeManagementStore } from '~/stores/timeManagement'
import { useApiService } from '~/services/api'
import type { DailyTemplate, TimeBlock, DailySchedule, TimeCategory, TimePriority, RepeatType } from '~/types'

export const useTimeManagement = () => {
  const store = useTimeManagementStore()
  const api = useApiService()

  async function fetchTemplates() {
    store.setLoading(true)
    store.setError(null)
    try {
      const res = await api.timeManagement.templates.list()
      store.setTemplates(res.data)
    } catch (err: any) {
      store.setError(err?.data?.statusMessage ?? 'Failed to load templates')
    } finally {
      store.setLoading(false)
    }
  }

  async function fetchTemplate(id: string) {
    store.setLoading(true)
    store.setError(null)
    try {
      const res = await api.timeManagement.templates.get(id)
      store.setCurrentTemplate(res.data)
      if (res.data.timeBlocks) store.setTimeBlocks(res.data.timeBlocks)
    } catch (err: any) {
      store.setError(err?.data?.statusMessage ?? 'Failed to load template')
    } finally {
      store.setLoading(false)
    }
  }

  async function createTemplate(payload: { name: string; description?: string; isActive?: boolean }) {
    const res = await api.timeManagement.templates.create(payload)
    store.addTemplate(res.data)
    return res.data
  }

  async function updateTemplate(id: string, payload: { name?: string; description?: string; isActive?: boolean }) {
    const res = await api.timeManagement.templates.update(id, payload)
    store.updateTemplate(res.data)
    return res.data
  }

  async function deleteTemplate(id: string) {
    await api.timeManagement.templates.delete(id)
    store.removeTemplate(id)
  }

  async function fetchTodaySchedule() {
    store.setLoading(true)
    store.setError(null)
    try {
      const res = await api.timeManagement.schedules.list()
      const today = new Date().toISOString().split('T')[0] ?? ''
      const todaySchedule = res.data.find((s: DailySchedule) => s.date.startsWith(today)) ?? null
      store.setTodaySchedule(todaySchedule)
      if (todaySchedule?.timeBlocks) store.setTimeBlocks(todaySchedule.timeBlocks)
    } catch (err: any) {
      store.setError(err?.data?.statusMessage ?? 'Failed to load schedule')
    } finally {
      store.setLoading(false)
    }
  }

  async function activateTemplateForToday(templateId: string) {
    const today = new Date().toISOString()
    const res = await api.timeManagement.schedules.create({ date: today, templateId })
    store.setTodaySchedule(res.data)
    return res.data
  }

  async function fetchTimeBlocks() {
    store.setLoading(true)
    store.setError(null)
    try {
      const res = await api.timeManagement.blocks.list()
      store.setTimeBlocks(res.data)
    } catch (err: any) {
      store.setError(err?.data?.statusMessage ?? 'Failed to load time blocks')
    } finally {
      store.setLoading(false)
    }
  }

  async function createTimeBlock(payload: {
    title: string
    description?: string
    startTime: string
    endTime: string
    duration: number
    category: TimeCategory
    priority?: TimePriority
    position?: number
    repeatType?: RepeatType
    templateId?: string
    scheduleId?: string
  }) {
    const res = await api.timeManagement.blocks.create(payload)
    store.addTimeBlock(res.data)
    return res.data
  }

  async function updateTimeBlock(id: string, payload: Partial<TimeBlock>) {
    const safePayload = {
      ...payload,
      description: payload.description ?? undefined,
      repeatDays: payload.repeatDays ?? undefined,
      repeatEnd: payload.repeatEnd ?? undefined,
    }
    const res = await api.timeManagement.blocks.update(id, safePayload)
    store.updateTimeBlock(res.data)
    return res.data
  }

  async function deleteTimeBlock(id: string) {
    await api.timeManagement.blocks.delete(id)
    store.removeTimeBlock(id)
  }

  async function toggleBlockComplete(block: TimeBlock) {
    return updateTimeBlock(block.id, { isCompleted: !block.isCompleted })
  }

  return {
    templates: computed(() => store.templates),
    currentTemplate: computed(() => store.currentTemplate),
    todaySchedule: computed(() => store.todaySchedule),
    timeBlocks: computed(() => store.timeBlocks),
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    fetchTodaySchedule,
    activateTemplateForToday,
    fetchTimeBlocks,
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    toggleBlockComplete,
  }
}
