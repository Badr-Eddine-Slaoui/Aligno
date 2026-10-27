import { init, captureException, captureMessage } from '@sentry/node'
import { logger } from './logger'

const dsn = process.env.SENTRY_DSN

if (dsn && process.env.NODE_ENV !== 'test') {
  init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  })
}

export const sentry = {
  captureException(err: unknown) {
    logger.error(err)
    if (dsn) {
      captureException(err)
    }
  },
  captureMessage(msg: string) {
    logger.info(msg)
    if (dsn) {
      captureMessage(msg)
    }
  },
}
