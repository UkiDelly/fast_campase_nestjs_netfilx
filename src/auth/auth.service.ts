import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import type { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService
  ) {}

  private hashPassword(password: string) {
    const SALT_ROUNDS = this.configService.get('SALT_ROUNDS');

    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async join(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password);

    let newUser = this.userRepository.create({ email, password: hashedPassword });
    newUser = await this.userRepository.save(newUser);

    // 민감 정보 삭제
    delete newUser.password;

    return newUser;
  }
}
