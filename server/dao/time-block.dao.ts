import type { TimeBlock } from '@prisma/client';

export interface CreateTimeBlockData {
  title: string
  description?: string

  startTime: string
  endTime: string
  duration: number

  category: "WORK" | "STUDY" | "HEALTH" | "BREAK" | "PERSONAL" | "MEETING" | "OTHER"
  priority?: "LOW" | "MEDIUM" | "HIGH"

  position?: number

  isCompleted?: boolean
  isLocked?: boolean

  repeatType?: "NONE" | "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY"
  repeatDays?: string
  repeatEnd?: Date

  templateId?: string
  scheduleId?: string

  userId: string
}

export interface UpdateTimeBlockData {
  title?: string
  description?: string

  startTime?: string
  endTime?: string
  duration?: number

  category?: "WORK" | "STUDY" | "HEALTH" | "BREAK" | "PERSONAL" | "MEETING" | "OTHER"
  priority?: "LOW" | "MEDIUM" | "HIGH"

  position?: number

  isCompleted?: boolean
  isLocked?: boolean

  repeatType?: "NONE" | "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY"
  repeatDays?: string
  repeatEnd?: Date | null

  templateId?: string | null
  scheduleId?: string | null
}

export interface ITimeBlockDAO {
  create(data: CreateTimeBlockData): Promise<TimeBlock>;
  findById(id: string): Promise<TimeBlock | null>;
  findByUserId(userId: string): Promise<TimeBlock[]>;
  findBySchedule(scheduleId: string): Promise<TimeBlock[]>;
  findByTemplate(templateId: string): Promise<TimeBlock[]>;
  update(id: string, data: UpdateTimeBlockData): Promise<TimeBlock>;
  delete(id: string): Promise<void>;
}