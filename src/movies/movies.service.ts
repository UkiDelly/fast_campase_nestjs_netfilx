import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from 'src/director/entities/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { DataSource, In, Like, Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import type { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { MovieDetail } from './entities/movie_detail.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    private readonly datasource: DataSource
  ) {}

  /**
   * Get many movies
   *
   * @param {string} title
   */
  async getManyMovies(title: string) {
    let movies: Movie[], count: number;
    if (title) {
      [movies, count] = await this.movieRepository.findAndCount({
        where: { title: Like(`$${title}$`) },
        relations: ['detail', 'director', 'genres'],
      });
    }

    [movies, count] = await this.movieRepository.findAndCount({ relations: ['detail', 'director', 'genres'] });

    return { movies, count };
  }

  /**
   * Get movie by id
   *
   * @param {number} id
   */
  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: { detail: true, director: true, genres: true },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }

  /**
   * Create a movie
   *
   * @param createMovieDto
   */
  async createMovie(createMovieDto: CreateMovieDto) {
    // 트랜잭션 설정
    const qr = this.datasource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const director: Director = await qr.manager.findOne(Director, { where: { id: createMovieDto.directorId } });
      const genres: Genre[] = await qr.manager.find(Genre, { where: { name: In(createMovieDto.genres) } });
      const notExistGenres = createMovieDto.genres.filter(name => !genres.some(genre => genre.name === name));

      // 존재하지 않는 장르를 생성
      if (notExistGenres.length > 0) {
        const newGenres = notExistGenres.map(name => qr.manager.create(Genre, { name }));
        await qr.manager.save(newGenres);
        genres.push(...newGenres);
      }

      const newMovie = await qr.manager.save({
        title: createMovieDto.title,
        detail: {
          detail: createMovieDto.detail,
        },
        genres,
        director,
      });

      await qr.commitTransaction();

      return newMovie;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  /**
   * Update a movie
   *
   * @param {number} id
   * @param updateDto
   */
  async updateMovie(id: number, updateDto: UpdateMovieDto) {
    const updatedMovie: Partial<Movie> = {};
    const movie: Movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });

    // 영화가 존재하지 않으면 에러를 발생시킨다.
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    // 구조 분해
    const { detail, directorId, genres, ...movieRest } = updateDto;

    // 감독을 찾아서 업데이트한다.
    if (directorId) {
      updatedMovie.director = await this.directorRepository.findOne({ where: { id: directorId } });
    }

    // detail 값 업데이트
    if (detail) {
      updatedMovie.detail = { ...movie.detail, detail };
    }

    // 장르를 찾아서 업데이트한다.
    if (genres) {
      const genreEntities = await Promise.all(
        genres.map(async name => {
          let genre = await this.genreRepository.findOne({ where: { name } });
          if (!genre) {
            genre = this.genreRepository.create({ name });
            await this.genreRepository.save(genre);
          }
          return genre;
        })
      );

      updatedMovie.genres = genreEntities;
    }

    await this.movieRepository.save({ ...movie, ...movieRest, ...updatedMovie });

    return this.getMovieById(id);
  }

  /**
   * Delete a movie
   *
   * @param {number} id
   */
  async deleteMovie(id: number) {
    const movieIndex = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });

    if (!movieIndex) {
      throw new NotFoundException('Movie not found');
    }

    await this.movieDetailRepository.delete(movieIndex.detail.id);

    return id;
  }

  // 쿼리빌더 사용하기
  async findAllQuery(title: string) {
    const qb = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.detail', 'detail')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .where('movie.title LIKE :title', { title: `%${title}%` })
      .getMany();

    return qb;
  }
}
