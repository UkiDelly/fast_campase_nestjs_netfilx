import type { HttpException } from '@nestjs/common'

export class BaseError extends Error {
  statusCode: number
  customMessage: string

  constructor(params: { message: string; statusCode: number }) {
    super(params.message)
    this.name = this.constructor.name
    this.customMessage = params.message
    this.statusCode = params.statusCode

    Error.captureStackTrace(this, this.constructor)
  }

  static fromHttpException(exception: HttpException) {
    return new BaseError({
      statusCode: exception.getStatus(),
      message: exception.message,
    })
  }
}
