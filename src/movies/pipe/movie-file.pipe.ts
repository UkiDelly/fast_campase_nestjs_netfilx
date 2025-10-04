import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import dayjs from 'dayjs'
import { rename } from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'

@Injectable()
export class MovieFilePipe implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>> {
  constructor(
    private readonly opions: {
      maxSize: number
      mimeType: string
    }
  ) {}

  async transform(value: Express.Multer.File, metadata: ArgumentMetadata): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('파일이 없습니다')
    }

    const byteSize = this.opions.maxSize * 1024 * 1024
    if (value.size > byteSize) {
      throw new BadRequestException(`${this.opions.maxSize}MB 이하의 파일만 업로드 가능합니다`)
    }

    if (value.mimetype !== this.opions.mimeType) {
      throw new BadRequestException(`${this.opions.mimeType} 파일만 업로드 가능합니다`)
    }

    const ext = value.filename.split('.').pop()
    value.filename = `${uuid()}_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.${ext}`
    const newPath = path.join(value.destination, value.filename)
    await rename(value.path, newPath)

    return {
      ...value,
      path: newPath,
      filename: value.filename,
    }
  }
}
