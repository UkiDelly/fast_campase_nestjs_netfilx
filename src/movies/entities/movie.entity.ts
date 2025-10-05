import { Director } from 'src/director/entities/director.entity'
import { User } from 'src/users/entities/user.entity'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { BaseTable } from '../../common/entity/base.entity'
import { Genre } from '../../genre/entities/genre.entity'
import { MovieUserDislike } from './movie-user-dislike.entity'
import { MovieUserLike } from './movie-user-like.entity'
import { MovieDetail } from './movie_detail.entity'

@Entity()
export class Movie extends BaseTable {
  // @Exclude() // 제외할 필드를 지정할 수 있음
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  // @Transform(({ value }) => value.toUpperCase()) // 커스텀 transformer
  @ManyToMany(() => Genre, genre => genre.movies, { cascade: true })
  @JoinTable({ name: 'movie_genre' })
  genres: Genre[]

  @OneToOne(() => MovieDetail, movieDetail => movieDetail.movie, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  detail: MovieDetail

  @ManyToOne(() => Director, director => director.movies, { cascade: true })
  @JoinColumn({ name: 'director_id' })
  director: Director | any

  @Column({ nullable: true, name: 'movie_file_path' })
  movieFilePath: string

  @ManyToOne(() => User, user => user.movies, { cascade: true })
  @JoinColumn()
  creator: User

  @OneToMany(() => MovieUserLike, movieLike => movieLike.movie)
  likes: MovieUserLike[]

  @OneToMany(() => MovieUserDislike, movieDislike => movieDislike.movie)
  dislikes: MovieUserDislike[]
}
