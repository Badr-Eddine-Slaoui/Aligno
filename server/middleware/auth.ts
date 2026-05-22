import { tokenService } from '../service/token.service'
import { userRepository } from '../repository/user.repository'
import { hashToken } from '../utils/crypto'
import { logger } from '../utils/logger'
import { sentry } from '../utils/sentry'

const PROTECTED_ROUTES = [
  { path: '/api/auth/me', method: 'GET' },
  { path: '/api/auth/logout', method: 'POST' },
]

const GUEST_ROUTES = [
  { path: '/api/auth/register', method: 'POST' },
  { path: '/api/auth/login', method: 'POST' },
  { path: '/api/auth/email/validation', method: 'POST' },
  { path: '/api/auth/forgot-password', method: 'POST' },
  { path: '/api/auth/reset-password', method: 'POST' },
]

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  const method = getMethod(event)

  const isGuest = GUEST_ROUTES.some(
    (r) => path === r.path && method === r.method,
  )

  if (isGuest) {
    const authHeader = getHeader(event, 'authorization')
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null

    if (accessToken) {
      try {
        tokenService.verifyAccessToken(accessToken)
        logger.warn(`Authenticated user attempted to access guest route ${method} ${path}`)
        throw createError({ statusCode: 403, statusMessage: 'Guests only' })
      } catch (err: any) {
        if (err.statusCode === 403) throw err
      }
    }

    const refreshToken = getCookie(event, 'refresh_token')
    if (refreshToken) {
      try {
        const payload = tokenService.verifyRefreshToken(refreshToken)
        const user = await userRepository.findById(payload.userId)
        if (user && user.refreshToken) {
          const hashedIncoming = hashToken(refreshToken)
          if (hashedIncoming === user.refreshToken) {
            logger.warn(`Authenticated user with valid refresh token attempted to access guest route ${method} ${path}`)
            throw createError({ statusCode: 403, statusMessage: 'Guests only' })
          }
        }
      } catch (err: any) {
        if (err.statusCode === 403) throw err
      }
    }
    return
  }

  const isProtected = PROTECTED_ROUTES.some(
    (r) => path === r.path && method === r.method,
  )

  if (!isProtected) return

  const authHeader = getHeader(event, 'authorization')
  const accessToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  if (accessToken) {
    try {
      const payload = tokenService.verifyAccessToken(accessToken)
      event.context.userId = payload.userId
      return
    } catch {
      logger.info('Access token verification failed or expired, attempting silent cookie refresh')
    }
  }

  const refreshToken = getCookie(event, 'refresh_token')

  if (!refreshToken) {
    logger.warn(`Unauthorized access attempt to ${method} ${path}`)
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  try {
    const payload = tokenService.verifyRefreshToken(refreshToken)

    const user = await userRepository.findById(payload.userId)
    if (!user || !user.refreshToken) {
      throw new Error('Token revoked')
    }

    const hashedIncoming = hashToken(refreshToken)
    if (hashedIncoming !== user.refreshToken) {
      throw new Error('Token mismatch')
    }

    const newAccessToken = tokenService.generateAccessToken(payload.userId)
    setHeader(event, 'X-Access-Token', newAccessToken)

    event.context.userId = payload.userId
    logger.info(`Session successfully refreshed for user: ${user.email}`)
  } catch (error) {
    sentry.captureException(error)
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
})

