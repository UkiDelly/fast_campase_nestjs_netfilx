import { BadRequestException, ClassSerializerInterceptor, Controller, Headers, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';

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

  @Post('join')
  join(@Headers('authorization') rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    return this.authService.join(email, password);
  }

  @Post('login')
  login(@Headers('authorization') rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);
    return this.authService.login(email, password);
  }
}
