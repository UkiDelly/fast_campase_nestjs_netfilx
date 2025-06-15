/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import type { Request } from 'express'
import { Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, any>()

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest()

    // 캐시 키 생성
    const key = `${req.method}:${req.path}`

    // 캐시 키가 존재하는 경우 캐시 반환
    if (this.cache.has(key)) {
      // of를 사용하면 일반 변수를 Observable로 변환할수 있음
      return of(this.cache.get(key))
    }

    return next.handle().pipe(tap(res => this.cache.set(key, res)))
  }
}
