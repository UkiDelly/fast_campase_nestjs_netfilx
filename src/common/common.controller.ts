import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ResponseData } from './ResponseData.dto'

@Controller('common')
export class CommonController {
  @Post('video')
  @UseInterceptors(
    FileInterceptor('movie', {
      limits: { fileSize: 1024 * 1024 * 10 },
      fileFilter(req: Request, file, cb) {
        if (file.mimetype !== 'video/mp4') {
          return cb(new BadRequestException('video/mp4 파일만 업로드 가능합니다'), false)
        } else {
          return cb(null, true)
        }
      },
    })
  )
  async createVideo(@UploadedFile() file: Express.Multer.File) {
    return ResponseData.data({ fileName: file.filename })
  }
}
