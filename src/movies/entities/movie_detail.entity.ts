import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Movie } from './movie.entity'

@Entity()
export class MovieDetail {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  detail: string

  @OneToOne(() => Movie, movie => movie.detail)
  @JoinColumn({ name: 'movie_id' })
  movie: any | Movie
}
