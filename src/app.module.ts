import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { DirectorModule } from './director/director.module';
import { Director } from './director/entities/director.entity';
import { Genre } from './genre/entities/genre.entity';
import { GenreModule } from './genre/genre.module';
import { Movie } from './movies/entities/movie.entity';
import { MovieDetail } from './movies/entities/movie_detail.entity';
import { MoviesModule } from './movies/movies.module';

config();

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   envFilePath: '.env',
    //   isGlobal: true,
    //   validationSchema: Joi.object({
    //     ENV: Joi.string().required().valid('dev', 'prod').default('dev'), // 환경 변수 검증
    //     PORT: Joi.number().required().default(3000), // 포트 검증
    //     DB_HOST: Joi.string().required(), // 데이터베이스 호스트 검증
    //     DB_USER: Joi.string().required(), // 데이터베이스 사용자 검증
    //     DB_PASSWORD: Joi.string().required(), // 데이터베이스 비밀번호 검증
    //     DB_NAME: Joi.string().required(), // 데이터베이스 이름 검증
    //   }),
    // }),

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
      entities: [Movie, MovieDetail, Director, Genre],
      poolSize: 10,
    }),
    // TypeOrmModule.forRootAsync({
    //   // ConfigService를 주입받아서 사용
    //   inject: [ConfigService],
    //   // useFactory를 사용하여 TypeORM 모듈을 반환
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: 'localhost', //configService.get('DB_HOST'),
    //     port: 5432, //configService.get<number>('DB_PORT'),
    //     username: 'postgres', //configService.get('DB_USER'),
    //     password: 'postgres', //configService.get('DB_PASSWORD'),
    //     database: 'fastcampus', //configService.get('DB_NAME'),
    //     schema: 'fastcampus', //configService.get('DB_NAME'),
    //     synchronize: true,
    //     autoLoadEntities: true,
    //     entities: ['dist/**/*.entity{.ts,.js}', 'src/**/*.entity{.ts,.js}', Movie, MovieDetail],
    //     poolSize: 10,
    //   }),
    // }),
    MoviesModule,
    DirectorModule,
    GenreModule,
    // ConfigModule이 초기화 이후 TypeOrmModule을 초기화하기 위해 forRootAsync를 사용
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
