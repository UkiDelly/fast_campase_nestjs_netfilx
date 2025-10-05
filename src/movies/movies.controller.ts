import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common'
import { Public } from 'src/auth/decorator/public.decorator'
import { RBAC } from 'src/auth/decorator/rbac.decorator'
import { QueryRunner } from 'src/common/decorator/query-runner.decorator'
import { CacheInterceptor } from 'src/common/intercepter/cache.interceptor'
import { TransactionInterceptor } from 'src/common/intercepter/transaction.interceptor'
import { ResponseData } from 'src/common/ResponseData.dto'
import { UserId } from 'src/users/decorator/user-id.decorator'
import { Role } from 'src/users/entities/user.entity'
import type { QueryRunner as QueryRunnerType } from 'typeorm'
import { CreateMovieDto } from './dto/create-movie.dto'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { MoviesService } from './movies.service'
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
  postMovie(@Body() body: CreateMovieDto, @UserId() userId: number, @QueryRunner() qr: QueryRunnerType) {
    console.table(body)
    return this.moviesService.createMovie(body, body.movieFilePath, userId)
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

  // ============================== 좋아요 / 싫어요 ==============================
  @Post(':id/like')
  @RBAC(Role.USER)
  async likeMovie(@Param('id', ParseIntPipe) id: number, @UserId() userId: number) {
    await this.moviesService.likeMovie(id, userId)

    return ResponseData.success()
  }

  @Post(':id/dislike')
  @RBAC(Role.USER)
  async dislikeMovie(@Param('id', ParseIntPipe) id: number, @UserId() userId: number) {
    await this.moviesService.dislikeMovie(id, userId)

    return ResponseData.success()
  }
}
