/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import dayjs from 'dayjs'
import type { Request } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest()
    const start = dayjs()

    return next.handle().pipe(
      tap(() => {
        const responseTime = dayjs()
        const diff = responseTime.diff(start, 'ms')

        console.log(`[${req.method}] - ${req.url} - ${diff}ms`)
      })
    )
  }
}
