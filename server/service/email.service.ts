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
  private resend: Resend | undefined
  private from = process.env.EMAIL_FROM || 'onboarding@resend.dev'

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey && apiKey !== 're_your_api_key' && apiKey !== 're_test_key') {
      this.resend = new Resend(apiKey)
      logger.info(`EmailService initialised. From: ${this.from}`)
    } else {
      logger.warn('RESEND_API_KEY is not set or is using placeholder. Emails will be skipped.')
    }
  }

  private shouldSkip(email: string): boolean {
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return true
    }
    const domain = email.split('@')[1]?.toLowerCase()
    if (domain === 'test.com' || domain === 'example.com' || email.includes('test')) {
      return true
    }
    return !this.resend
  }

  async sendVerificationEmail(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const appUrl = process.env.APP_URL || 'http://localhost:4000'
    const url = `${appUrl}/verify-email?token=${token}`

    logger.info(`[Verification Link for ${email}]: ${url}`)

    if (this.shouldSkip(email)) {
      logger.info(`Skipping verification email to ${email} (test env/mock domain/no Resend).`)
      return
    }

    try {
      const vnode = h(VerificationEmail, { firstName, url })
      const { html } = await useRender(vnode)

      const response = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: 'Verify your email — Aligno',
        html,
      })

      if (response.error) {
        logger.error(`Resend API error sending to ${email}: ${JSON.stringify(response.error)}`)
        throw new Error(response.error.message || 'Resend API error')
      }

      logger.info(`Verification email queued (Resend ID: ${response.data?.id}) from: ${this.from} to: ${email}`)
    } catch (error: any) {
      sentry.captureException(error)
      logger.error(`Failed to send verification email to ${email}: ${error?.message}`)
      throw createError({
        statusCode: 500,
        statusMessage: error?.message || 'Could not send verification email. Please try again later.',
      })
    }
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const appUrl = process.env.APP_URL || 'http://localhost:4000'
    const url = `${appUrl}/reset-password?token=${token}`

    logger.info(`[Password Reset Link for ${email}]: ${url}`)

    if (this.shouldSkip(email)) {
      logger.info(`Skipping password reset email to ${email} (test env/mock domain/no Resend).`)
      return
    }

    try {
      const vnode = h(PasswordResetEmail, { firstName, url })
      const { html } = await useRender(vnode)

      const response = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: 'Reset your password — Aligno',
        html,
      })

      if (response.error) {
        throw new Error(response.error.message || 'Resend API error')
      }

      logger.info(`Password reset email sent successfully to ${email}`)
    } catch (error: any) {
      sentry.captureException(error)
      logger.error(`Failed to send password reset email to ${email}: ${error?.message}`)
      throw createError({
        statusCode: 500,
        statusMessage: error?.message || 'Could not send password reset email. Please try again later.',
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
    const appUrl = process.env.APP_URL || 'http://localhost:4000'
    const acceptUrl = `${appUrl}/api/project-management/members/invite/accept?token=${acceptToken}`
    const declineUrl = `${appUrl}/api/project-management/members/invite/decline?token=${acceptToken}`

    logger.info(`[Project Invite Accept Link for ${email}]: ${acceptUrl}`)
    logger.info(`[Project Invite Decline Link for ${email}]: ${declineUrl}`)

    if (this.shouldSkip(email)) {
      logger.info(`Skipping project invite email to ${email} (test env/mock domain/no Resend).`)
      return
    }

    try {
      const vnode = h(ProjectInviteEmail, {
        inviteeName,
        inviterName,
        projectName,
        role,
        acceptUrl,
        declineUrl,
      })
      const { html } = await useRender(vnode)

      const response = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `You've been invited to collaborate on "${projectName}" — Aligno`,
        html,
      })

      if (response.error) {
        throw new Error(response.error.message || 'Resend API error')
      }

      logger.info(`Project invite email sent successfully to ${email}`)
    } catch (error: any) {
      sentry.captureException(error)
      logger.error(`Failed to send project invite email to ${email}: ${error?.message}`)
      throw createError({
        statusCode: 500,
        statusMessage: error?.message || 'Could not send project invite email. Please try again later.',
      })
    }
  }

  async sendProjectDueDateReminderEmail(
    email: string,
    firstName: string,
    projectName: string,
    dueDate: string,
  ): Promise<void> {
    logger.info(`[Project Due Date Reminder for ${email}]: Project "${projectName}" is due tomorrow!`)

    if (this.shouldSkip(email)) {
      logger.info(`Skipping project due date reminder email to ${email} (test env/mock domain/no Resend).`)
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

      const response = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `Project "${projectName}" is due tomorrow! — Aligno`,
        html,
      })

      if (response.error) {
        throw new Error(response.error.message || 'Resend API error')
      }

      logger.info(`Project due reminder email sent successfully to ${email}`)
    } catch (error: any) {
      sentry.captureException(error)
      logger.error(`Failed to send project due date reminder email to ${email}: ${error?.message}`)
      // Non-critical: log but don't block the user
    }
  }

  async sendCardDueDateReminderEmail(
    email: string,
    firstName: string,
    cardTitle: string,
    projectName: string,
    dueDate: string,
  ): Promise<void> {
    logger.info(`[Card Due Date Reminder for ${email}]: Card "${cardTitle}" in "${projectName}" is due tomorrow!`)

    if (this.shouldSkip(email)) {
      logger.info(`Skipping card due date reminder email to ${email} (test env/mock domain/no Resend).`)
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

      const response = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `Task "${cardTitle}" is due tomorrow! — Aligno`,
        html,
      })

      if (response.error) {
        throw new Error(response.error.message || 'Resend API error')
      }

      logger.info(`Card due reminder email sent successfully to ${email}`)
    } catch (error: any) {
      sentry.captureException(error)
      logger.error(`Failed to send card due date reminder email to ${email}: ${error?.message}`)
      // Non-critical: log but don't block the user
    }
  }

  async sendCardAssignedEmail(
    email: string,
    firstName: string,
    cardTitle: string,
    projectName: string,
    assignerName: string,
  ): Promise<void> {
    logger.info(`[Card Assigned Notification for ${email}]: Assigned "${cardTitle}" in "${projectName}" by ${assignerName}`)

    if (this.shouldSkip(email)) {
      logger.info(`Skipping card assigned email to ${email} (test env/mock domain/no Resend).`)
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

      const response = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `New task assigned: "${cardTitle}" — Aligno`,
        html,
      })

      if (response.error) {
        throw new Error(response.error.message || 'Resend API error')
      }

      logger.info(`Card assigned email sent successfully to ${email}`)
    } catch (error: any) {
      sentry.captureException(error)
      logger.error(`Failed to send card assigned email to ${email}: ${error?.message}`)
      // Non-critical: log but don't block the user
    }
  }

  async sendMemberRemovedEmail(
    email: string,
    firstName: string,
    projectName: string,
    removerName: string,
  ): Promise<void> {
    logger.info(`[Member Removed Notification for ${email}]: Removed from "${projectName}" by ${removerName}`)

    if (this.shouldSkip(email)) {
      logger.info(`Skipping member removed email to ${email} (test env/mock domain/no Resend).`)
      return
    }

    try {
      const vnode = h(MemberRemovedEmail, {
        firstName,
        projectName,
        removerName,
      })
      const { html } = await useRender(vnode)

      const response = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `Removed from project "${projectName}" — Aligno`,
        html,
      })

      if (response.error) {
        throw new Error(response.error.message || 'Resend API error')
      }

      logger.info(`Member removed email sent successfully to ${email}`)
    } catch (error: any) {
      sentry.captureException(error)
      logger.error(`Failed to send member removed email to ${email}: ${error?.message}`)
      // Non-critical: log but don't block the user
    }
  }
}

export const emailService = new EmailService()
