import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DirectorService } from 'src/director/director.service';
import type { Director } from 'src/director/entities/director.entity';
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
  ) {}

  /**
   * Get many movies
   *
   * @param {string} title
   */
  async getManyMovies(title: string) {
    let movies, count;
    if (title) {
      [movies, count] = await this.movieRepository.findAndCount({
        where: { title: Like(`$${title}$`) },
        relations: ['detail', 'director'],
      });
    }

    [movies, count] = await this.movieRepository.find({ relations: ['detail', 'director'] });

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
      relations: { detail: true, director: true },
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

    return this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: {
        detail: createMovieDto.detail,
      },
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
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    const { detail, directorId, ...movieRest } = updateDto;

    if (directorId) {
      const director = await this.directService.findOne(directorId);

      updatedMovie.director = director;
    }

    if (detail) {
      updatedMovie.detail = { ...movie.detail, detail };
    }

    await this.movieRepository.update(id, { ...movieRest, ...updatedMovie });

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
