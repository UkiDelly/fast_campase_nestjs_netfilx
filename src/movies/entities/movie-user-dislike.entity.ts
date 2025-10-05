import { User } from 'src/users/entities/user.entity'
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Movie } from './movie.entity'

@Entity()
export class MovieUserDislike {
  @PrimaryColumn({
    name: 'movie_id',
    type: 'int8',
  })
  @ManyToOne(() => Movie, movie => movie.dislikes, { cascade: true })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie

  @PrimaryColumn({
    name: 'user_id',
    type: 'int8',
  })
  @ManyToOne(() => User, user => user.dislikes, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User
}
