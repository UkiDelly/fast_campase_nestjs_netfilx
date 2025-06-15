import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common'
import { Public } from 'src/auth/decorator/public.decorator'
import { RBAC } from 'src/auth/decorator/rbac.decorator'
import { CacheInterceptor } from 'src/common/intercepter/cache.interceptor'
import { Role } from 'src/users/entities/user.entity'
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
  postMovie(@Body() body: CreateMovieDto) {
    return this.moviesService.createMovie(body)
  }

  @Patch(':id')
  @RBAC(Role.ADMIN)
  patchMovie(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMovieDto) {
    return this.moviesService.updateMovie(id, body)
  }

  @Delete(':id')
  @RBAC(Role.ADMIN)
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.deleteMovie(id)
  }
}
