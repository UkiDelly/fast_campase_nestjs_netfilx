import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  detail: string

  @IsNotEmpty()
  @IsNumber()
  directorId: number

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  genres: string[]

  @IsString()
  @IsNotEmpty()
  movieFilePath: string
}
