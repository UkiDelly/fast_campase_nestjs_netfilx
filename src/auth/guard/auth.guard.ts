import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { Observable } from 'rxjs'
import type { DecodedToken } from 'src/util/types'
import { Public } from '../decorator/public.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 만약 Public 데코레이터가 있으면 true를 반환
    const isPublic = this.reflector.get(Public, context.getHandler())

    // 만약 Public 데코레이터가 있으면 true를 반환
    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest() as Request

    // 요청에서 request.user가 없거나, request.user의 type이 access가 아니면 false를 반환
    if (!request.user || (request.user as DecodedToken).type !== 'access') {
      return false
    }

    return true
  }
}
