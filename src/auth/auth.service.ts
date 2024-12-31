import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, SALT_ROUNDS } from 'src/common/const/env.const';
import { User, type Role } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  private hashPassword(password: string) {
    const salt = this.configService.get(SALT_ROUNDS);

    return bcrypt.hash(password, salt);
  }

  /**
   * 회원가입
   * @param email
   * @param password
   * @returns
   */
  async join(email: string, password: string) {
    await this.authenticate(email, password);

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password);

    let newUser = this.userRepository.create({ email, password: hashedPassword });
    newUser = await this.userRepository.save(newUser);

    return newUser;
  }

  async login(email: string, password: string) {
    const user = await this.authenticate(email, password);

    const accessToken = await this.issueToken(user, false);
    const refreshToken = await this.issueToken(user, true);

    return { accessToken, refreshToken };
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('존재하지 않는 이메일입니다.');
    }

    return user;
  }

  issueToken(user: { id: number; role: Role }, isRefreshToken: boolean) {
    const secret = isRefreshToken ? this.configService.get(REFRESH_TOKEN_SECRET) : this.configService.get(ACCESS_TOKEN_SECRET);

    const expiresIn = isRefreshToken ? '1d' : '5m';

    return this.jwtService.signAsync({ id: user.id, role: user.role, type: isRefreshToken ? 'refresh' : 'access' }, { secret, expiresIn });
  }

  async rotateAccessToken(token: string) {
    try {
      const decoded = await this.jwtService.verify(token, { secret: this.configService.get(REFRESH_TOKEN_SECRET) });

      if (decoded.type !== 'refresh') {
        throw new BadRequestException('토큰 타입이 잘못 되었습니다.');
      }

      const accessToken = await this.issueToken({ id: decoded.id, role: decoded.role }, false);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }
  }
}
