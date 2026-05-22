import { h } from 'vue'
import { useRender } from 'vue-email'
import { Resend } from 'resend'
import { VerificationEmail } from '../emails/VerificationEmail'
import { PasswordResetEmail } from '../emails/PasswordResetEmail'
import { logger } from '../utils/logger'
import { sentry } from '../utils/sentry'

export class EmailService {
  private resend: Resend
  private from = 'onboarding@resend.dev'

  constructor() {
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
}

export const emailService = new EmailService()
