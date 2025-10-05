import { createParamDecorator, InternalServerErrorException, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

export const QueryRunner = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>()

  if (!request || !request.qr) {
    throw new InternalServerErrorException('QueryRunner not found')
  }

  return request.qr
})
