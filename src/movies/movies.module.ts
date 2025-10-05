import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Director } from 'src/director/entities/director.entity'
import { Genre } from 'src/genre/entities/genre.entity'
import { MovieUserDislike } from './entities/movie-user-dislike.entity'
import { MovieUserLike } from './entities/movie-user-like.entity'
import { Movie } from './entities/movie.entity'
import { MovieDetail } from './entities/movie_detail.entity'
import { MoviesController } from './movies.controller'
import { MoviesService } from './movies.service'

@Module({
  imports: [TypeOrmModule.forFeature([Movie, MovieDetail, Director, Genre, MovieUserLike, MovieUserDislike])],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
