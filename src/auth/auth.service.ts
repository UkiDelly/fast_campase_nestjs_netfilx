import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from 'src/common/const/env.const'
import { User } from 'src/users/entities/user.entity'
import type { DecodedToken } from 'src/util/types'
import { Repository } from 'typeorm'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  private hashPassword(password: string) {
    const salt = this.configService.get(SALT_ROUNDS)

    return bcrypt.hash(password, salt)
  }

  /**
   * 회원가입
   * @param email
   * @param password
   * @returns
   */
  async join(email: string, password: string) {
    await this.authenticate(email, password)

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password)

    let newUser = this.userRepository.create({ email, password: hashedPassword })
    newUser = await this.userRepository.save(newUser)

    return newUser
  }

  async login(email: string, password: string) {
    const user = await this.authenticate(email, password)

    const accessToken = await this.issueToken({ id: user.id, type: 'access' })
    const refreshToken = await this.issueToken({ id: user.id, type: 'refresh' })

    return { accessToken, refreshToken }
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } })
    if (!user) {
      throw new NotFoundException('존재하지 않는 이메일입니다.')
    }

    return user
  }

  issueToken(payload: { id: number; type: 'access' | 'refresh' }) {
    const secret = this.configService.get('JWT_SECRET')
    const isRefreshToken = payload.type === 'refresh'

    const expiresIn = isRefreshToken ? '1d' : '5m'

    return this.jwtService.signAsync({ id: payload.id, type: isRefreshToken ? 'refresh' : 'access' }, { secret, expiresIn })
  }

  async rotateAccessToken(payload: DecodedToken) {
    try {
      const accessToken = await this.issueToken({ id: payload.id, type: 'access' })

      return { accessToken }
    } catch (error) {
      throw new UnauthorizedException('토큰이 만료되었습니다.')
    }
  }
}
