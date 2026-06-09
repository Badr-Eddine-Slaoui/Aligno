import type { DailySchedule } from '@prisma/client'

export interface CreateDailyScheduleData {
  date: Date
  userId: string
  templateId?: string
}

export interface UpdateDailyScheduleData {
  date?: Date
  templateId?: string | null
}

export interface IDailyScheduleDAO {
  create(data: CreateDailyScheduleData): Promise<DailySchedule>
  findById(id: string): Promise<DailySchedule | null>
  findByUserIdAndDate(userId: string, date: Date): Promise<DailySchedule | null>
  findByDate(userId: string, date: Date): Promise<DailySchedule | null>
  update(id: string, data: UpdateDailyScheduleData): Promise<DailySchedule>
  delete(id: string): Promise<void>
}