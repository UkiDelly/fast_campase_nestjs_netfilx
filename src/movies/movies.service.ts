import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DirectorService } from 'src/director/director.service';
import type { Director } from 'src/director/entities/director.entity';
import type { Genre } from 'src/genre/entities/genre.entity';
import { GenreService } from 'src/genre/genre.service';
import { Like, Repository } from 'typeorm';
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
    private readonly directService: DirectorService,
    private readonly genreService: GenreService,
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
    const director: Director = await this.directService.findOne(createMovieDto.directorId);
    const genres: Genre[] = await this.genreService.findGenresOrCreate(createMovieDto.genres);

    return this.movieRepository.save({
      title: createMovieDto.title,
      detail: {
        detail: createMovieDto.detail,
      },
      genres,
      director,
    });
  }

  /**
   * Update a movie
   *
   * @param {number} id
   * @param {string} title
   */
  async updateMovie(id: number, updateDto: UpdateMovieDto) {
    const updatedMovie: Partial<Movie> = {};
    const movie = await this.movieRepository.findOne({
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
      const director = await this.directService.findOne(directorId);
      updatedMovie.director = director;
    }

    // detail 값 업데이트
    if (detail) {
      updatedMovie.detail = { ...movie.detail, detail };
    }

    // 장르를 찾아서 업데이트한다.
    if (genres) {
      const genreEntities = await this.genreService.findGenresOrCreate(genres);
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
}
