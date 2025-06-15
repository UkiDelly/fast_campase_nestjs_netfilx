import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common'
import dayjs from 'dayjs'
import type { Request, Response } from 'express'
import { QueryFailedError } from 'typeorm'

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>()
    const res = host.switchToHttp().getResponse<Response>()
    const statusCode = 400
    let message = '데이터베이스 에러'
    if (exception.message.includes('duplicate key')) {
      message = '이미 존재하는 데이터입니다.'
    }

    res.status(statusCode).json({
      statusCode,
      timestamp: dayjs().format('YYYY-MM-DD a hh:mm:ss'),
      path: req.url,
      message,
    })
  }
}
