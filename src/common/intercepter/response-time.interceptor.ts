/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor } from '@nestjs/common'
import dayjs from 'dayjs'
import type { Request } from 'express'
import { Observable } from 'rxjs'
import { delay, tap } from 'rxjs/operators'

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest()
    const start = dayjs()

    return next.handle().pipe(
      delay(1000),
      tap(() => {
        const responseTime = dayjs()
        const diff = responseTime.diff(start, 'ms')

        // 에러를 던질수도 있음
        // 1초 이상 걸린다면 TIME OUT 처리
        if (diff > 1000) {
          console.warn(`[${req.method}] - ${req.url} - TIME OUT!!`)
          throw new InternalServerErrorException('서버 처리 시간이 너무 오래 걸렸습니다.')
        }

        console.log(`[${req.method}] - ${req.url} - ${diff}ms`)
      })
    )
  }
}
