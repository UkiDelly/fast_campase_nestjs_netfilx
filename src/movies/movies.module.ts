import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { TypeOrmModule } from '@nestjs/typeorm'
import dayjs from 'dayjs'
import { diskStorage } from 'multer'
import path from 'path'
import { Director } from 'src/director/entities/director.entity'
import { Genre } from 'src/genre/entities/genre.entity'
import { v4 as uuid } from 'uuid'
import { Movie } from './entities/movie.entity'
import { MovieDetail } from './entities/movie_detail.entity'
import { MoviesController } from './movies.controller'
import { MoviesService } from './movies.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, MovieDetail, Director, Genre]),
    MulterModule.register({
      storage: diskStorage({
        destination: path.join(process.cwd(), 'public', 'temp'),
        filename(req, file, cb) {
          const ext = file.filename.split('.').pop()
          cb(null, `${uuid()}_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.${ext}`)
        },
      }),
    }),
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
