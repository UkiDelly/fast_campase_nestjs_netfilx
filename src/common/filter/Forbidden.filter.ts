import { Catch, ForbiddenException, type ArgumentsHost, type ExceptionFilter, type HttpException } from '@nestjs/common'
import dayjs from 'dayjs'
import { Request, type Response } from 'express'

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>()
    const res = host.switchToHttp().getResponse<Response>()

    const status = exception.getStatus()
    console.log(`[Unauthorized Exception] : [${req.method}] = ${req.url}`)

    res.status(status).json({
      statusCode: status,
      message: '권한이 없습니다',
      time: dayjs().format('YYYY-MM-DD a hh:mm:ss'),
      path: req.url,
    })
  }
}
