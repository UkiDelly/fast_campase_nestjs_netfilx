import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import type { User } from 'src/users/entities/user.entity';
import { AuthService } from '../auth.service';

export const LocalAuthGuard = AuthGuard('local');

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * LocalStrategy는 validate 함수의 파라미터로 username과 password를 받는다.
   * 이를 통해 유저를 검증하고, 유저 정보를 반환한다.
   *
   * 반환하는 값은 Request 객체에 저장된다.
   */
  async validate(username: string, password: string): Promise<User> {
    const user = await this.authService.authenticate(username, password);
    return user;
  }
}
