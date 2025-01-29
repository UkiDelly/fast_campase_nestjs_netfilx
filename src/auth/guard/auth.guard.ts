import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import type { Request } from 'express'
import { Observable } from 'rxjs'
import type { DecodedToken } from 'src/util/types'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest() as Request

    if (!request.user || (request.user as DecodedToken).type !== 'access') {
      return false
    }

    return true
  }
}
