import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateDirectorDto } from './dto/create-director.dto'
import { UpdateDirectorDto } from './dto/update-director.dto'
import { Director } from './entities/director.entity'

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorService: Repository<Director>
  ) {}

  findAll() {
    return this.directorService.find()
  }

  async findOne(id: number) {
    const director = await this.directorService.findOne({ where: { id } })

    if (!director) {
      throw new NotFoundException('Director not found')
    }

    return director
  }

  create(createDirectorDto: CreateDirectorDto) {
    return this.directorService.save(createDirectorDto)
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    await this.findOne(id)
    await this.directorService.update({ id }, updateDirectorDto)

    return this.findOne(id)
  }

  async remove(id: number) {
    await this.directorService.delete(id)

    return id
  }
}
