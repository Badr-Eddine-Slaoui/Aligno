export interface CreateTimeBlockDTO {
  title: string
  description?: string

  startTime: string
  endTime: string

  duration: number

  category:
    | 'WORK'
    | 'STUDY'
    | 'HEALTH'
    | 'BREAK'
    | 'PERSONAL'
    | 'MEETING'
    | 'OTHER'

  priority?: 'LOW' | 'MEDIUM' | 'HIGH'

  position?: number

  repeatType?: 'NONE' | 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'

  repeatDays?: string

  repeatEnd?: Date

  templateId?: string

  scheduleId?: string
}

export interface UpdateTimeBlockDTO {
  title?: string
  description?: string

  startTime?: string
  endTime?: string

  duration?: number

  category?:
    | 'WORK'
    | 'STUDY'
    | 'HEALTH'
    | 'BREAK'
    | 'PERSONAL'
    | 'MEETING'
    | 'OTHER'

  priority?: 'LOW' | 'MEDIUM' | 'HIGH'

  position?: number

  isCompleted?: boolean

  isLocked?: boolean

  repeatType?: 'NONE' | 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'

  repeatDays?: string

  repeatEnd?: Date | null
}

export interface CreateDailyTemplateDTO {
  name: string
  description?: string
}

export interface UpdateDailyTemplateDTO {
  name?: string
  description?: string
  isActive?: boolean
}

export interface CreateDailyScheduleDTO {
  date: Date
  templateId?: string
}

export interface UpdateDailyScheduleDTO {
  date?: Date
  templateId?: string | null
}