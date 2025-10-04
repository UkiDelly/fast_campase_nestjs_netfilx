import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import dayjs from 'dayjs'
import { diskStorage } from 'multer'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { CommonController } from './common.controller'

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: path.join(process.cwd(), 'public', 'temp'),
        filename(req, file, cb) {
          const ext = file.filename.split('.').pop()
          cb(null, `${uuid()}_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.${ext}`)
        },
      }),
    }),
  ],
  controllers: [CommonController],
})
export class CommonModule {}
