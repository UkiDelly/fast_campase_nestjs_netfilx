import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { BaseTable } from '../../common/entity/base.entity'
import { Movie } from '../../movies/entities/movie.entity'

@Entity()
export class Genre extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @ManyToMany(() => Movie, movie => movie.genres)
  movies: Movie[]
}
