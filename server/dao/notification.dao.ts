import type { Notification } from '@prisma/client'

export interface CreateNotificationData {
  type: string
  title: string
  message: string
  metadata?: any
  userId: string
}

export interface INotificationDAO {
  create(data: CreateNotificationData): Promise<Notification>
  findById(id: string): Promise<Notification | null>
  findByUserId(
    userId: string,
    options: { page: number; limit: number; isRead?: boolean },
  ): Promise<{ notifications: Notification[]; total: number }>
  markAsRead(id: string): Promise<Notification>
  markAllAsRead(userId: string): Promise<number>
  countUnread(userId: string): Promise<number>
}
