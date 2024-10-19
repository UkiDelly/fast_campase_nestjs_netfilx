import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { transaction } from 'src/util/transaction';
import { DataSource, In, Repository } from 'typeorm';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre) private readonly genreRepository: Repository<Genre>,
    private readonly dataSource: DataSource
  ) {}

  async create(createGenreDto: CreateGenreDto) {
    const newGenre = await transaction(this.dataSource, qr => {
      return qr.manager.save(Genre, createGenreDto);
    });

    return newGenre;
  }

  async findAll() {
    return this.genreRepository.find();
  }

  async findOne(id: number) {
    const genre: Genre = await this.genreRepository.findOne({ where: { id } });

    if (!genre) {
      throw new NotFoundException(`Genre with id ${id} not found`);
    }

    return genre;
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    await this.findOne(id);
    await this.genreRepository.update(id, updateGenreDto);

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.genreRepository.delete(id);

    return { id };
  }

  async findGenresOrCreate(names: string[]) {
    // 이미 존재하는 장르를 찾아서 반환

    const genres: Genre[] = await this.genreRepository.find({
      where: {
        name: In(names),
      },
    });

    // 존재하지 않는 장르를 생성
    const notFoundGenres: string[] = names.filter(name => !genres.some(genre => genre.name === name));

    // 존재하지 않는 장르가 없다면 반환
    if (notFoundGenres.length === 0) {
      return genres;
    }

    // 존재하지 않는 장르를 생성
    let newGenres: Genre[] = notFoundGenres.map(name => this.genreRepository.create({ name }));
    newGenres = await this.genreRepository.save(newGenres);

    return [...genres, ...newGenres];
  }
}
