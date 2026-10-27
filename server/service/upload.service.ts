import sharp from 'sharp'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger'
import { sentry } from '../utils/sentry'

const UPLOAD_DIR = path.resolve('public/uploads/avatars')
const MAX_SIZE = 400
const QUALITY = 80

export class UploadService {
  async processProfilePicture(fileBuffer: Buffer, originalName: string): Promise<string> {
    logger.info(`Processing profile picture upload for: ${originalName}`)
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true })

      const ext = 'webp'
      const filename = `${uuidv4()}.${ext}`
      const filepath = path.join(UPLOAD_DIR, filename)

      await sharp(fileBuffer)
        .resize(MAX_SIZE, MAX_SIZE, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(filepath)

      logger.info(`Profile picture stored successfully: /uploads/avatars/${filename}`)
      return `/uploads/avatars/${filename}`
    } catch (error) {
      sentry.captureException(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Could not process profile picture upload. Please try again.',
      })
    }
  }
}

export const uploadService = new UploadService()
