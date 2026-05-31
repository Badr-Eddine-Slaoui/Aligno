import { Queue, Worker, Job } from 'bullmq'
import { redis } from './redis'
import { logger } from './logger'
import { prisma } from './prisma'
import { emailService } from '../service/email.service'
import { notificationRepository } from '../repository/notification.repository'
import { emitToUser } from './socket'

const queueName = 'due-date-reminders'

export const dueDateQueue = new Queue(queueName, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 100,
  },
})

export async function scheduleProjectReminder(projectId: string, dueDate: Date) {
  const jobId = `project:${projectId}`
  
  // Remove existing job if any
  await removeScheduledReminder(jobId)

  // Calculate delay (1 day before due date)
  const reminderTime = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000)
  const delay = reminderTime.getTime() - Date.now()

  if (delay > 0) {
    await dueDateQueue.add(
      'project-due-reminder',
      { projectId },
      { jobId, delay },
    )
    logger.info(`Scheduled project reminder for project ${projectId} in ${delay}ms`)
  }
}

export async function scheduleCardReminder(cardId: string, dueDate: Date) {
  const jobId = `card:${cardId}`
  
  // Remove existing job if any
  await removeScheduledReminder(jobId)

  // Calculate delay (1 day before due date)
  const reminderTime = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000)
  const delay = reminderTime.getTime() - Date.now()

  if (delay > 0) {
    await dueDateQueue.add(
      'card-due-reminder',
      { cardId },
      { jobId, delay },
    )
    logger.info(`Scheduled card reminder for card ${cardId} in ${delay}ms`)
  }
}

export async function cancelProjectReminder(projectId: string) {
  await removeScheduledReminder(`project:${projectId}`)
}

export async function cancelCardReminder(cardId: string) {
  await removeScheduledReminder(`card:${cardId}`)
}

async function removeScheduledReminder(jobId: string) {
  try {
    const job = await dueDateQueue.getJob(jobId)
    if (job) {
      await job.remove()
      logger.info(`Removed scheduled job: ${jobId}`)
    }
  } catch (err) {
    logger.error(err, `Failed to remove scheduled job ${jobId}`)
  }
}

// Worker definition
let worker: Worker | null = null

export function initQueueWorker() {
  if (worker) return worker

  worker = new Worker(
    queueName,
    async (job: Job) => {
      logger.info(`Processing job ${job.id} of type ${job.name}`)

      if (job.name === 'project-due-reminder') {
        const { projectId } = job.data
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            owner: true,
            members: {
              where: { inviteStatus: 'ACCEPTED' },
              include: { user: true },
            },
          },
        })

        if (!project || project.isArchived || project.dueDateReminderSent) return

        // Mark as sent
        await prisma.project.update({
          where: { id: projectId },
          data: { dueDateReminderSent: true },
        })

        // Notify owner
        await sendProjectDueDateNotification(project.owner, project)

        // Notify all accepted members
        for (const member of project.members) {
          await sendProjectDueDateNotification(member.user, project)
        }
      }

      if (job.name === 'card-due-reminder') {
        const { cardId } = job.data
        const card = await prisma.kanbanCard.findUnique({
          where: { id: cardId },
          include: {
            assignee: true,
            column: {
              include: {
                project: {
                  include: {
                    owner: true,
                  },
                },
              },
            },
          },
        })

        if (!card || card.dueDateReminderSent) return

        // Mark as sent
        await prisma.kanbanCard.update({
          where: { id: cardId },
          data: { dueDateReminderSent: true },
        })

        const recipient = card.assignee || card.column.project.owner
        const projectName = card.column.project.name
        const formattedDueDate = card.dueDate ? new Date(card.dueDate).toLocaleDateString() : ''

        // Send email
        await emailService.sendCardDueDateReminderEmail(
          recipient.email,
          recipient.firstName,
          card.title,
          projectName,
          formattedDueDate,
        )

        // Create in-app notification
        const notif = await notificationRepository.create({
          type: 'CARD_DUE_SOON',
          title: 'Task Due Soon',
          message: `Your task "${card.title}" in project "${projectName}" is due tomorrow.`,
          metadata: { cardId: card.id, projectId: card.column.project.id },
          userId: recipient.id,
        })

        emitToUser(recipient.id, 'notification:new', { notification: notif })
      }
    },
    { connection: redis },
  )

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`)
  })

  worker.on('failed', (job, err) => {
    logger.error(err, `Job ${job?.id} failed with error`)
  })

  return worker
}

async function sendProjectDueDateNotification(user: any, project: any) {
  const formattedDueDate = project.dueDate ? new Date(project.dueDate).toLocaleDateString() : ''

  // Send email
  await emailService.sendProjectDueDateReminderEmail(
    user.email,
    user.firstName,
    project.name,
    formattedDueDate,
  )

  // Create in-app notification
  const notif = await notificationRepository.create({
    type: 'PROJECT_DUE_SOON',
    title: 'Project Due Soon',
    message: `The project "${project.name}" is due tomorrow.`,
    metadata: { projectId: project.id },
    userId: user.id,
  })

  emitToUser(user.id, 'notification:new', { notification: notif })
}
