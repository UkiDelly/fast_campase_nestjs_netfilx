import * as dayjs from 'dayjs';
import { Movie } from 'src/movies/entities/movie.entity';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Director extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    transformer: {
      to: (value: Date) => dayjs(value).format('YYYY-MM-DD'),
      from: (value: string) => dayjs(value).toDate(),
    },
  })
  dob: Date;

  @Column()
  nationality: string;

  @OneToMany(() => Movie, movie => movie.director)
  movies: Movie[];
}
