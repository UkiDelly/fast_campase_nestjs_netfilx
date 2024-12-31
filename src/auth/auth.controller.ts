import { BadRequestException, ClassSerializerInterceptor, Controller, Get, Headers, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ResponseData } from 'src/common/ResponseData.dto';
import type { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './strategy/JwtStrategy';
import { LocalAuthGuard } from './strategy/LocalStrategy';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private parseBasicToken(rawToken: string) {
    const [type, token] = rawToken.split(' ');
    if (!token || type !== 'Basic') {
      throw new BadRequestException('토큰 포맷이 잘못 되었습니다.');
    }

    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    const [email, password] = decodedToken.split(':');
    if (!email || !password) {
      throw new BadRequestException('토큰 포맷이 잘못 되었습니다.');
    }

    return { email, password };
  }

  private parseBearerToken(rawToken: string) {
    const [type, token] = rawToken.split(' ');
    if (!token || type !== 'Bearer') {
      throw new BadRequestException('토큰 포맷이 잘못 되었습니다.');
    }

    return token;
  }

  @Post('join')
  join(@Headers('authorization') rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    return this.authService.join(email, password);
  }

  @Post('login')
  async login(@Headers('authorization') rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);
    const tokens = await this.authService.login(email, password);

    return ResponseData.data(tokens);
  }

  @UseGuards(LocalAuthGuard)
  @Post('passport-login')
  async passportLogin(@Request() req: Request & { user: User }) {
    const accessToken = await this.authService.issueToken(req.user, false);
    const refreshToken = await this.authService.issueToken(req.user, true);

    return ResponseData.data({ accessToken, refreshToken });
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  private(@Request() req: Request & { user: User }) {
    return req.user;
  }

  @Post('token/access')
  async rotateAccessToken(@Headers('authorization') rawToken: string) {
    const token = this.parseBearerToken(rawToken);

    const newToken = await this.authService.rotateAccessToken(token);

    return ResponseData.data(newToken);
  }
}
