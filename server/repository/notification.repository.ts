import type { Notification } from '@prisma/client'
import type { INotificationDAO, CreateNotificationData } from '../dao/notification.dao'
import { prisma } from '../utils/prisma'

export class NotificationRepository implements INotificationDAO {
  async create(data: CreateNotificationData): Promise<Notification> {
    return prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || undefined,
        userId: data.userId,
      },
    })
  }

  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({ where: { id } })
  }

  async findByUserId(
    userId: string,
    options: { page: number; limit: number; isRead?: boolean },
  ): Promise<{ notifications: Notification[]; total: number }> {
    const page = options.page || 1
    const limit = options.limit || 20
    const skip = (page - 1) * limit

    const whereClause: any = { userId }
    if (options.isRead !== undefined) {
      whereClause.isRead = options.isRead
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: whereClause,
      }),
    ])

    return { notifications, total }
  }

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
  }

  async markAllAsRead(userId: string): Promise<number> {
    const { count } = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
    return count
  }

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    })
  }
}

export const notificationRepository = new NotificationRepository()
