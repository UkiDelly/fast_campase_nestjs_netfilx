import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTable } from './base.entity';
import { MovieDetail } from './movie_detail.entity';

@Entity()
export class Movie extends BaseTable {
  // @Exclude() // 제외할 필드를 지정할 수 있음
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // @Transform(({ value }) => value.toUpperCase()) // 커스텀 transformer
  @Column()
  genre: string;

  @OneToOne(() => MovieDetail, movieDetail => movieDetail.movie)
  detail: MovieDetail;
}
