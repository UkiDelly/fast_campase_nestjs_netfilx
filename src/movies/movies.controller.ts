import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

import { MoviesService } from './movies.service';

// @UseInterceptors(ClassSerializerInterceptor) // class-transformer를 사용하여 응답값을 serialize하기 위해 Interceptor 적용
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  getMovies(@Query('title') title: string) {
    // return this.moviesService.getManyMovies(title);
    return this.moviesService.findAllQuery(title);
  }

  @Get(':id')
  getMovie(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getMovieById(id);
  }

  @Post()
  postMovie(@Body() body: CreateMovieDto) {
    return this.moviesService.createMovie(body);
  }

  @Patch(':id')
  patchMovie(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMovieDto) {
    return this.moviesService.updateMovie(id, body);
  }

  @Delete(':id')
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.deleteMovie(id);
  }
}
