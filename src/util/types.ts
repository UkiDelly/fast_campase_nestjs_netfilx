import type { Role } from 'src/users/entities/user.entity'

export type DecodedToken = {
  id: number
  type: 'access' | 'refresh'
  role: Role
}
