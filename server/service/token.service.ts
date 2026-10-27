import jwt from 'jsonwebtoken'

export interface TokenPayload {
  userId: string
}

export class TokenService {
  private readonly accessSecret: string
  private readonly refreshSecret: string
  private readonly accessExpiry = '15m' as const
  private readonly refreshExpiry = '30d' as const

  constructor() {
    this.accessSecret = process.env.JWT_SECRET || 'fallback_jwt_secret'
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
  }

  generateAccessToken(userId: string): string {
    return jwt.sign({ userId } satisfies TokenPayload, this.accessSecret, {
      expiresIn: this.accessExpiry,
    })
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId } satisfies TokenPayload, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
    })
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.accessSecret) as TokenPayload
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.refreshSecret) as TokenPayload
  }
}

export const tokenService = new TokenService()
