import { Exclude } from 'class-transformer'
import { BaseTable } from 'src/common/entity/base.entity'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

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
}
