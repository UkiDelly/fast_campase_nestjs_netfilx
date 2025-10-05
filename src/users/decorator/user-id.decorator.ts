import { createParamDecorator, UnauthorizedException, type ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import type { DecodedToken } from 'src/util/types'

export const UserId = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>()

  if (!request || !request.user || !(request.user as DecodedToken).id) {
    throw new UnauthorizedException('유저 정보가 없습니다.')
  }
  return (request.user as DecodedToken).id
})
