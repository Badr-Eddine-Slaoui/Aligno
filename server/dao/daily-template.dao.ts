import type { DailyTemplate } from '@prisma/client'

export interface CreateDailyTemplateData {
  name: string
  description?: string
  isActive?: boolean
  userId: string
}

export interface UpdateDailyTemplateData {
  name?: string
  description?: string
  isActive?: boolean
}

export interface IDailyTemplateDAO {
  create(data: CreateDailyTemplateData): Promise<DailyTemplate>
  findById(id: string): Promise<DailyTemplate | null>
  findByUserId(userId: string): Promise<DailyTemplate[]>
  findActive(userId: string): Promise<DailyTemplate | null>
  update(id: string, data: UpdateDailyTemplateData): Promise<DailyTemplate>
  delete(id: string): Promise<void>
}