import { notificationRepository } from '../repository/notification.repository'
import { NotificationMapper } from '../mapper/project.mapper'
import type { PaginatedNotificationsResponseDto, NotificationResponseDto } from '../dto/project-management.dto'

export class NotificationService {
  async listNotifications(
    userId: string,
    options: { page: number; limit: number; isRead?: boolean },
  ): Promise<PaginatedNotificationsResponseDto> {
    const page = options.page || 1
    const limit = options.limit || 20

    const { notifications, total } = await notificationRepository.findByUserId(userId, options)
    const unreadCount = await notificationRepository.countUnread(userId)

    return {
      notifications: notifications.map((n) => NotificationMapper.toResponseDto(n)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponseDto> {
    const notif = await notificationRepository.findById(notificationId)
    if (!notif) {
      throw createError({ statusCode: 404, statusMessage: 'Notification not found' })
    }

    if (notif.userId !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Unauthorized to mark this notification as read' })
    }

    const updated = await notificationRepository.markAsRead(notificationId)
    return NotificationMapper.toResponseDto(updated)
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await notificationRepository.markAllAsRead(userId)
    return { count }
  }
}

export const notificationService = new NotificationService()
