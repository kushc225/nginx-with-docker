import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { ResponseLoggingInterceptor } from './logging/response-logging.interceptor';
import { HttpExceptionFilter } from './logging/http-exception.filter';
import { winstonLoggerOptions } from './logging/winston-logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
      load: [configuration],
    }),
    WinstonModule.forRoot(winstonLoggerOptions),
    PrismaModule,
    RedisModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, ResponseLoggingInterceptor, HttpExceptionFilter],
})
export class AppModule {}
