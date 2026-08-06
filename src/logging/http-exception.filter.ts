import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = exception instanceof HttpException
      ? exception.getResponse()
      : {
          statusCode: status,
          message: 'Internal server error',
        };

    const errorLog = {
      url: request.url,
      method: request.method,
      body: request.body,
      headers: request.headers,
      status,
      error: responseBody,
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    this.logger.error('Unhandled exception', errorLog);

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
