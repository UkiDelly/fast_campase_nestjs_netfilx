import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { Role } from 'src/users/entities/user.entity'
import { DecodedToken } from 'src/util/types'
import { RBAC } from '../decorator/rbac.decorator'

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const role: Role = this.reflector.get<Role>(RBAC, context.getHandler())

    // RBAC 데코레이터가 없으면 RBAC을 적용하지 않는 것이므로 가드를 통과
    if (!role) {
      return true
    }

    const request: Request = context.switchToHttp().getRequest()
    const user = request.user as DecodedToken

    // AuthGuard을 통과하지 않으면 request.user가 없으므로 false를 반환
    if (!user) {
      return false
    }

    // 권한 레벨 매핑
    const roleLevel = {
      admin: 3,
      paid_user: 2,
      user: 1,
    }

    // 권한 레벨 비교
    if (roleLevel[user.role] < roleLevel[role]) {
      return false
    }

    return true
  }
}
