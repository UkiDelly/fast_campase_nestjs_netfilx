import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectorModule } from 'src/director/director.module';
import { Movie } from './entities/movie.entity';
import { MovieDetail } from './entities/movie_detail.entity';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, MovieDetail]), DirectorModule],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
