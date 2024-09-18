import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsNotEmpty()
  directorId: number;

  @IsArray()
  genres: string[];
}
