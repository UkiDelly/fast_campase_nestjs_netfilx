import type { HttpException } from '@nestjs/common'
import type { BaseError } from './BaseError'

export class ResponseData<T> {
  statusCode: number
  message: string
  data: T | T[] | null
  error: Error | null

  constructor(params: { statusCode: number; message: string; data: T | T[] | null; error: Error | null }) {
    this.statusCode = params.statusCode
    this.message = params.message

    if (Array.isArray(params.data)) {
      this.data = params.data
    } else {
      this.data = [params.data]
    }
    this.error = params.error
  }

  static success() {
    return new ResponseData({ statusCode: 200, message: 'success', data: null, error: null })
  }

  static data<T>(data: T | T[]) {
    return new ResponseData({ statusCode: 200, message: 'success', data, error: null })
  }

  static error(error: BaseError) {
    return new ResponseData({ statusCode: error.statusCode ?? 500, message: 'error', data: null, error })
  }

  static fromHttpException(exception: HttpException) {
    return new ResponseData({
      statusCode: exception.getStatus(),
      message: exception.message,
      data: null,
      error: exception,
    })
  }
}
