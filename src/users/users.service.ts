import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}
  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto)
  }

  findAll() {
    return this.userRepository.find()
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.')
    }
    return user
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    let user = await this.findOne(id)
    await this.userRepository.update({ id }, updateUserDto)

    user = await this.findOne(id)

    return user
  }

  async remove(id: number) {
    const user = await this.findOne(id)
    await this.userRepository.remove(user)
  }
}
