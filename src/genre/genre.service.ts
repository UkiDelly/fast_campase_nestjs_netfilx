import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenreService {
  constructor(@InjectRepository(Genre) private readonly genreService: Repository<Genre>) {}

  async create(createGenreDto: CreateGenreDto) {
    const newGenre = this.genreService.create(createGenreDto);

    return this.genreService.save(newGenre);
  }

  async findAll() {
    return this.genreService.find();
  }

  async findOne(id: number) {
    return this.genreService.findOne({ where: { id } });
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    return this.genreService.update(id, updateGenreDto);
  }

  async remove(id: number) {
    await this.genreService.delete(id);

    return { id };
  }
}
