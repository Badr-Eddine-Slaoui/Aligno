import { h } from 'vue'
import { useRender } from 'vue-email'
import { Resend } from 'resend'
import { VerificationEmail } from '../emails/VerificationEmail'
import { PasswordResetEmail } from '../emails/PasswordResetEmail'
import { ProjectInviteEmail } from '../emails/ProjectInviteEmail'
import { ProjectDueDateReminderEmail } from '../emails/ProjectDueDateReminderEmail'
import { CardDueDateReminderEmail } from '../emails/CardDueDateReminderEmail'
import { CardAssignedEmail } from '../emails/CardAssignedEmail'
import { MemberRemovedEmail } from '../emails/MemberRemovedEmail'
import { logger } from '../utils/logger'
import { sentry } from '../utils/sentry'

export class EmailService {
  private resend: Resend
  private from = 'onboarding@resend.dev'

  constructor() {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')
    this.resend = new Resend(process.env.RESEND_API_KEY)
  }

  async sendVerificationEmail(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      logger.info(`Verification email skipped in test environment for ${email}`)
      return
    }

    try {
      const appUrl = process.env.APP_URL || 'http://localhost:4000'
      const url = `${appUrl}/api/auth/email/validation?token=${token}`

      const vnode = h(VerificationEmail, { firstName, url })
      const { html } = await useRender(vnode)

      await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: 'Verify your email — Aligno',
        html,
      })
      logger.info(`Verification email sent successfully to ${email}`)
    } catch (error) {
      sentry.captureException(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Could not send verification email. Please try again later.',
      })
    }
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      logger.info(`Password reset email skipped in test environment for ${email}`)
      return
    }

    try {
      const appUrl = process.env.APP_URL || 'http://localhost:4000'
      const url = `${appUrl}/auth/reset-password?token=${token}`

      const vnode = h(PasswordResetEmail, { firstName, url })
      const { html } = await useRender(vnode)

      await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: 'Reset your password — Aligno',
        html,
      })
      logger.info(`Password reset email sent successfully to ${email}`)
    } catch (error) {
      sentry.captureException(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Could not send password reset email. Please try again later.',
      })
    }
  }

  async sendProjectInviteEmail(
    email: string,
    inviteeName: string,
    inviterName: string,
    projectName: string,
    role: string,
    acceptToken: string,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      logger.info(`Project invite email skipped in test environment for ${email}`)
      return
    }

    try {
      const appUrl = process.env.APP_URL || 'http://localhost:4000'
      const acceptUrl = `${appUrl}/api/project-management/members/invite/accept?token=${acceptToken}`
      const declineUrl = `${appUrl}/api/project-management/members/invite/decline?token=${acceptToken}`

      const vnode = h(ProjectInviteEmail, {
        inviteeName,
        inviterName,
        projectName,
        role,
        acceptUrl,
        declineUrl,
      })
      const { html } = await useRender(vnode)

      await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `You've been invited to collaborate on "${projectName}" — Aligno`,
        html,
      })
      logger.info(`Project invite email sent successfully to ${email}`)
    } catch (error) {
      sentry.captureException(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Could not send project invite email. Please try again later.',
      })
    }
  }

  async sendProjectDueDateReminderEmail(
    email: string,
    firstName: string,
    projectName: string,
    dueDate: string,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      logger.info(`Project due reminder email skipped in test environment for ${email}`)
      return
    }

    try {
      const appUrl = process.env.APP_URL || 'http://localhost:4000'
      const dashboardUrl = `${appUrl}/project-management`

      const vnode = h(ProjectDueDateReminderEmail, {
        firstName,
        projectName,
        dueDate,
        dashboardUrl,
      })
      const { html } = await useRender(vnode)

      await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `Project "${projectName}" is due tomorrow! — Aligno`,
        html,
      })
      logger.info(`Project due reminder email sent successfully to ${email}`)
    } catch (error) {
      sentry.captureException(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Could not send project due date reminder email.',
      })
    }
  }

  async sendCardDueDateReminderEmail(
    email: string,
    firstName: string,
    cardTitle: string,
    projectName: string,
    dueDate: string,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      logger.info(`Card due reminder email skipped in test environment for ${email}`)
      return
    }

    try {
      const appUrl = process.env.APP_URL || 'http://localhost:4000'
      const dashboardUrl = `${appUrl}/project-management`

      const vnode = h(CardDueDateReminderEmail, {
        firstName,
        cardTitle,
        projectName,
        dueDate,
        dashboardUrl,
      })
      const { html } = await useRender(vnode)

      await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `Task "${cardTitle}" is due tomorrow! — Aligno`,
        html,
      })
      logger.info(`Card due reminder email sent successfully to ${email}`)
    } catch (error) {
      sentry.captureException(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Could not send card due date reminder email.',
      })
    }
  }

  async sendCardAssignedEmail(
    email: string,
    firstName: string,
    cardTitle: string,
    projectName: string,
    assignerName: string,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      logger.info(`Card assigned email skipped in test environment for ${email}`)
      return
    }

    try {
      const appUrl = process.env.APP_URL || 'http://localhost:4000'
      const dashboardUrl = `${appUrl}/project-management`

      const vnode = h(CardAssignedEmail, {
        firstName,
        cardTitle,
        projectName,
        assignerName,
        dashboardUrl,
      })
      const { html } = await useRender(vnode)

      await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `New task assigned: "${cardTitle}" — Aligno`,
        html,
      })
      logger.info(`Card assigned email sent successfully to ${email}`)
    } catch (error) {
      sentry.captureException(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Could not send card assignment notification email.',
      })
    }
  }

  async sendMemberRemovedEmail(
    email: string,
    firstName: string,
    projectName: string,
    removerName: string,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      logger.info(`Member removed email skipped in test environment for ${email}`)
      return
    }

    try {
      const vnode = h(MemberRemovedEmail, {
        firstName,
        projectName,
        removerName,
      })
      const { html } = await useRender(vnode)

      await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `Removed from project "${projectName}" — Aligno`,
        html,
      })
      logger.info(`Member removed email sent successfully to ${email}`)
    } catch (error) {
      sentry.captureException(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Could not send member removal notification email.',
      })
    }
  }
}

export const emailService = new EmailService()
