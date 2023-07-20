import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse() as
      | string
      | { error: string; statusCode: number; message: string | string[] };

    if (status === 413) {
      response.status(status).json({
        success: false,
        error: 'Payload Too Large',
        message: '10MB 이하 크기의 파일만 가능합니다.',
        statusCode: 413,
      });
    } else if (typeof error === 'string') {
      response.status(status).json({
        success: false,
        path: request.url,
        error,
      });
    } else {
      response.status(status).json({
        success: false,
        ...error,
      });
    }
  }
}
