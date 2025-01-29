import { Module, RequestMethod, type MiddlewareConsumer, type NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { config } from 'dotenv'
import Joi from 'joi'
import { AuthModule } from './auth/auth.module'
import { AuthGuard } from './auth/guard/auth.guard'
import { DirectorModule } from './director/director.module'
import { Director } from './director/entities/director.entity'
import { Genre } from './genre/entities/genre.entity'
import { GenreModule } from './genre/genre.module'
import { Movie } from './movies/entities/movie.entity'
import { MovieDetail } from './movies/entities/movie_detail.entity'
import { MoviesModule } from './movies/movies.module'
import { User } from './users/entities/user.entity'
import { UsersModule } from './users/users.module'
import { BearerTokenMiddleware } from './util/middlewares/bearertoken.middleware'

config()

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().required().valid('dev', 'prod').default('dev'), // 환경 변수 검증
        DB_PORT: Joi.number().required().default(3000), // 포트 검증
        DB_HOST: Joi.string().required(), // 데이터베이스 호스트 검증
        DB_USER: Joi.string().required(), // 데이터베이스 사용자 검증
        DB_PASSWORD: Joi.string().required(), // 데이터베이스 비밀번호 검증
        DB_NAME: Joi.string().required(), // 데이터베이스 이름 검증
        SCHEMA: Joi.string().required(), // 데이터베이스 스키마 검증
        // SALT_ROUNDS: Joi.number().required(),
        // ACCESS_TOKEN_SECRET: Joi.string().required(),
        // REFRESH_TOKEN_SECRET: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', //configService.get('DB_HOST'),
      port: 5432, //configService.get<number>('DB_PORT'),
      username: 'postgres', //configService.get('DB_USER'),
      password: 'postgres', //configService.get('DB_PASSWORD'),
      database: 'fastcampus', //configService.get('DB_NAME'),
      schema: 'fastcampus', //configService.get('DB_NAME'),
      synchronize: true,
      autoLoadEntities: true,
      entities: [Movie, MovieDetail, Director, Genre, User],
      poolSize: 10,
    }),

    MoviesModule,
    DirectorModule,
    GenreModule,
    UsersModule,
    AuthModule,
    // ConfigModule이 초기화 이후 TypeOrmModule을 초기화하기 위해 forRootAsync를 사용
  ],
  controllers: [],
  providers: [JwtService, ConfigService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleware)
      .exclude({ path: '/auth/login', method: RequestMethod.POST }, { path: '/auth/register', method: RequestMethod.POST })
      .forRoutes('*')
  }
}
