import {
  BadRequestException,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import type { Request } from 'express'
import { ResponseData } from 'src/common/ResponseData.dto'
import type { User } from 'src/users/entities/user.entity'
import type { DecodedToken } from 'src/util/types'
import { AuthService } from './auth.service'
import { Public } from './decorator/public.decorator'
import { JwtAuthGuard } from './strategy/JwtStrategy'
import { LocalAuthGuard } from './strategy/LocalStrategy'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private parseBasicToken(rawToken: string) {
    const [type, token] = rawToken.split(' ')
    if (!token || type !== 'Basic') {
      throw new BadRequestException('토큰 포맷이 잘못 되었습니다.')
    }

    const decodedToken = Buffer.from(token, 'base64').toString('utf-8')
    const [email, password] = decodedToken.split(':')
    if (!email || !password) {
      throw new BadRequestException('토큰 포맷이 잘못 되었습니다.')
    }

    return { email, password }
  }

  @Post('join')
  @Public()
  join(@Headers('authorization') rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken)

    return this.authService.join(email, password)
  }

  @Post('login')
  @Public()
  async login(@Headers('authorization') rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken)
    const tokens = await this.authService.login(email, password)

    return ResponseData.data(tokens)
  }

  @UseGuards(LocalAuthGuard)
  @Post('passport-login')
  async passportLogin(@Req() req: Request & { user: User }) {
    const accessToken = await this.authService.issueToken({ id: req.user.id, type: 'access' })
    const refreshToken = await this.authService.issueToken({ id: req.user.id, type: 'refresh' })

    return ResponseData.data({ accessToken, refreshToken })
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  private(@Req() req: Request & { user: User }) {
    return req.user
  }

  @Post('token/access')
  async rotateAccessToken(@Req() req: Request) {
    const payload = req.user as DecodedToken
    if (!payload) {
      throw new UnauthorizedException('인증 실패')
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh 토큰이 아닙니다.')
    }

    const newToken = await this.authService.rotateAccessToken(payload)

    return ResponseData.data(newToken)
  }
}
