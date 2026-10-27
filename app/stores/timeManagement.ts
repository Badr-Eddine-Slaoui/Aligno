import { defineStore } from 'pinia'
import type { DailyTemplate, TimeBlock, DailySchedule } from '~/types'

export const useTimeManagementStore = defineStore('timeManagement', () => {
  const templates = ref<DailyTemplate[]>([])
  const currentTemplate = ref<DailyTemplate | null>(null)
  const todaySchedule = ref<DailySchedule | null>(null)
  const timeBlocks = ref<TimeBlock[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function setTemplates(data: DailyTemplate[]) {
    templates.value = data
  }

  function setCurrentTemplate(data: DailyTemplate | null) {
    currentTemplate.value = data
  }

  function setTodaySchedule(data: DailySchedule | null) {
    todaySchedule.value = data
  }

  function setTimeBlocks(data: TimeBlock[]) {
    timeBlocks.value = data
  }

  function addTemplate(template: DailyTemplate) {
    templates.value.unshift(template)
  }

  function updateTemplate(updated: DailyTemplate) {
    const idx = templates.value.findIndex((t) => t.id === updated.id)
    if (idx !== -1) templates.value[idx] = updated
    if (currentTemplate.value?.id === updated.id) currentTemplate.value = updated
  }

  function removeTemplate(id: string) {
    templates.value = templates.value.filter((t) => t.id !== id)
    if (currentTemplate.value?.id === id) currentTemplate.value = null
  }

  function addTimeBlock(block: TimeBlock) {
    timeBlocks.value.push(block)
  }

  function updateTimeBlock(updated: TimeBlock) {
    const idx = timeBlocks.value.findIndex((b) => b.id === updated.id)
    if (idx !== -1) timeBlocks.value[idx] = updated
  }

  function removeTimeBlock(id: string) {
    timeBlocks.value = timeBlocks.value.filter((b) => b.id !== id)
  }

  function setLoading(value: boolean) {
    isLoading.value = value
  }

  function setError(message: string | null) {
    error.value = message
  }

  function reset() {
    templates.value = []
    currentTemplate.value = null
    todaySchedule.value = null
    timeBlocks.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    templates,
    currentTemplate,
    todaySchedule,
    timeBlocks,
    isLoading,
    error,
    setTemplates,
    setCurrentTemplate,
    setTodaySchedule,
    setTimeBlocks,
    addTemplate,
    updateTemplate,
    removeTemplate,
    addTimeBlock,
    updateTimeBlock,
    removeTimeBlock,
    setLoading,
    setError,
    reset,
  }
})
