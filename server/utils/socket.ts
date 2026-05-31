import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { redis } from './redis'
import { logger } from './logger'
import jwt from 'jsonwebtoken'

let io: Server | null = null

export function initSocketServer(server: any) {
  if (io) return io

  const pubClient = redis
  const subClient = redis.duplicate()

  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    adapter: createAdapter(pubClient, subClient),
  })

  io.use((socket, next) => {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers['authorization']?.split(' ')[1]
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'))
    }

    try {
      const secret = process.env.JWT_SECRET || 'your_super_secret_key'
      const decoded = jwt.verify(token, secret) as any
      socket.data.user = decoded
      next()
    } catch (err) {
      next(new Error('Authentication error: Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.data.user.id
    logger.info(`User ${userId} connected to socket`)

    // Join user's personal room
    socket.join(`user:${userId}`)

    // Handle joining project rooms
    socket.on('project:join', (projectId: string) => {
      socket.join(`project:${projectId}`)
      logger.info(`User ${userId} joined room project:${projectId}`)
    })

    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`)
      logger.info(`User ${userId} left room project:${projectId}`)
    })

    socket.on('disconnect', () => {
      logger.info(`User ${userId} disconnected from socket`)
    })
  })

  return io
}

export function getSocketServer(): Server | null {
  return io
}

export function emitToProject(projectId: string, event: string, payload: any) {
  if (!io) {
    logger.debug(`Socket.IO not initialized. Skipping emitToProject ${projectId} - ${event}`)
    return
  }
  io.to(`project:${projectId}`).emit(event, payload)
}

export function emitToUser(userId: string, event: string, payload: any) {
  if (!io) {
    logger.debug(`Socket.IO not initialized. Skipping emitToUser ${userId} - ${event}`)
    return
  }
  io.to(`user:${userId}`).emit(event, payload)
}
export function emitToUsers(userIds: string[], event: string, payload: any) {
  if (!io) return
  userIds.forEach((userId) => {
    io!.to(`user:${userId}`).emit(event, payload)
  })
}
