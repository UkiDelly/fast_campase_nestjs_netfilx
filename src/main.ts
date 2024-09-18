import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dayjs from 'dayjs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  dayjs.locale('ko-KR');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // 정의하지 않는 속성은 반영 X, 즉, 데코레이터가 없는 속성은 무시
      forbidNonWhitelisted: true, // 정의하지 않은 속성이 있으면 에러 발생
    }),
  );
  await app.listen(3000);
}

bootstrap().then(() => {});
