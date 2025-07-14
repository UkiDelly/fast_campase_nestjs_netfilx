/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import type { Request } from 'express'
import { catchError, Observable, tap } from 'rxjs'
import { DataSource } from 'typeorm'

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly datasource: DataSource) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest()
    const qr = this.datasource.createQueryRunner()

    await qr.connect()
    await qr.startTransaction()

    // 트랜잭션 객체를 요청 객체에 추가
    // @ts-expect-error 타입 정의가 없는 경우 사용
    req.qr = qr

    return next.handle().pipe(
      catchError(async error => {
        await qr.rollbackTransaction()
        await qr.release()
        throw error
      }),
      tap(async () => {
        await qr.commitTransaction()
        await qr.release()
      })
    )
  }
}
