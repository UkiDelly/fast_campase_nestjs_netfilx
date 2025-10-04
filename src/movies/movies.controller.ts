import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { Request } from 'express'
import { Public } from 'src/auth/decorator/public.decorator'
import { RBAC } from 'src/auth/decorator/rbac.decorator'
import { CacheInterceptor } from 'src/common/intercepter/cache.interceptor'
import { TransactionInterceptor } from 'src/common/intercepter/transaction.interceptor'
import { Role } from 'src/users/entities/user.entity'
import { CreateMovieDto } from './dto/create-movie.dto'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { MoviesService } from './movies.service'
import { MovieFilePipe } from './pipe/movie-file.pipe'
import { MovieTitleValidationPipe } from './pipe/movie_title_validation.pipe'

// @UseInterceptors(ClassSerializerInterceptor) // class-transformer를 사용하여 응답값을 serialize하기 위해 Interceptor 적용
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @Public()
  getMovies(@Query('title', MovieTitleValidationPipe) title: string) {
    return this.moviesService.getManyMovies(title)
    // return this.moviesService.findAllQuery(title)
  }

  @Get(':id')
  @Public()
  getMovie(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory(err) {
          return new BadRequestException('id에는 숫자를 입력해주세요')
        },
      })
    )
    id: number
  ) {
    return this.moviesService.getMovieById(id)
  }

  @Post()
  @RBAC(Role.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'movie', maxCount: 1 },
        { name: 'poster', maxCount: 2 },
      ],
      {
        limits: { fileSize: 1024 * 1024 * 10 },
        fileFilter(req: Request, file, cb) {
          if (file.mimetype !== 'video/mp4') {
            return cb(new BadRequestException('video/mp4 파일만 업로드 가능합니다'), false)
          } else {
            return cb(null, true)
          }
        },
      }
    )
  )
  postMovie(
    @Body() body: CreateMovieDto,
    @UploadedFiles(new MovieFilePipe({ maxSize: 20, mimeType: 'video/mp4' }))
    file: {
      movie?: Express.Multer.File[]
      poster?: Express.Multer.File[]
    }
  ) {
    console.table(file)
    return this.moviesService.createMovie(body)
  }

  @Patch(':id')
  @RBAC(Role.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  patchMovie(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMovieDto) {
    return this.moviesService.updateMovie(id, body)
  }

  @Delete(':id')
  @RBAC(Role.ADMIN)
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.deleteMovie(id)
  }
}
