import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import type { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { MovieDetail } from './entities/movie_detail.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie) private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail) private readonly movieDetailRepository: Repository<MovieDetail>
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
      });
    }

    [movies, count] = await this.movieRepository.find();

    return { movies, count };
  }

  /**
   * Get movie by id
   *
   * @param {number} id
   */
  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id }, relations: { detail: true } });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }

  /**
   * Create a movie
   *
   * @param {string} title
   */
  async createMovie(createMovieDto: CreateMovieDto) {
    const movieDetail = await this.movieDetailRepository.save({ detail: createMovieDto.detail });
    return this.movieRepository.save({ title: createMovieDto.title, genre: createMovieDto.genre, detail: movieDetail });
  }

  /**
   * Update a movie
   *
   * @param {number} id
   * @param {string} title
   */
  async updateMovie(id: number, updateDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({ where: { id }, relations: ['detail'] });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    // const detail = movie.detail;

    // if (updateDto.detail) {
    //   detail.detail = updateDto.detail;
    // }
    // movie.detail = detail;

    // await this.movieRepository.update({ id }, { ...updateDto, detail: detail });
  }

  /**
   * Delete a movie
   *
   * @param {number} id
   */
  async deleteMovie(id: number) {
    const movieIndex = await this.movieRepository.findOne({ where: { id } });

    if (!movieIndex) {
      throw new NotFoundException('Movie not found');
    }

    await this.movieRepository.delete(id);

    return id;
  }
}
