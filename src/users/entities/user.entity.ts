import { Exclude } from 'class-transformer'
import { BaseTable } from 'src/common/entity/base.entity'
import { MovieUserDislike } from 'src/movies/entities/movie-user-dislike.entity'
import { MovieUserLike } from 'src/movies/entities/movie-user-like.entity'
import { Movie } from 'src/movies/entities/movie.entity'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  PAID_USER = 'paid_user',
}

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  @Exclude({
    toPlainOnly: true,
  })
  password: string

  @Column({ enum: Role, default: Role.USER })
  role: Role

  @OneToMany(() => Movie, movie => movie.creator)
  movies: Movie[]

  @OneToMany(() => MovieUserLike, movieLike => movieLike.user)
  likes: MovieUserLike[]

  @OneToMany(() => MovieUserDislike, movieDislike => movieDislike.user)
  dislikes: MovieUserDislike[]
}
