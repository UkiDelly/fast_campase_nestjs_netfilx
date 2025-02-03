/*
https://docs.nestjs.com/middleware#middleware
*/

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { Request, Response, type NextFunction } from 'express'

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization

    if (!token) {
      next()
      return
    }

    try {
      const [bearer, rawToken] = token.split(' ')
      if (bearer !== 'Bearer') {
        throw new UnauthorizedException('토큰 형식이 올바르지 않습니다.')
      }

      if (!rawToken) {
        throw new UnauthorizedException('토큰이 없습니다.')
      }

      const decoded = await this.jwtService.verifyAsync(rawToken, { secret: this.configService.get<string>('JWT_SECRET') })

      // 토큰 타입 검증
      if (decoded.type !== 'access' && decoded.type !== 'refresh') {
        throw new UnauthorizedException('토큰이 유효하지 않습니다.')
      }

      const isRefreshToken = decoded.type === 'refresh'

      // 토큰 타입 검증
      if (isRefreshToken) {
        if (decoded.type !== 'refresh') {
          throw new UnauthorizedException('Refresh 토큰이 아닙니다.')
        }
      } else {
        if (decoded.type !== 'access') {
          throw new UnauthorizedException('Access 토큰이 아닙니다.')
        }
      }

      // 토큰 id 검증
      if (!decoded.id) {
        throw new UnauthorizedException('토큰이 유효하지 않습니다.')
      }

      req.user = decoded
      next()
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException('토큰이 만료되었습니다.')
      } else {
        next()
      }
    }
  }
}
