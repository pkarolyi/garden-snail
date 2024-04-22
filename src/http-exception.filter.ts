import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

const CUSTOM_CODES: Record<string, string> = {
  NotFoundException: 'not_found',
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const status = exception.getStatus();

    response.status(status).send({
      error: {
        message: exception.message,
        code: CUSTOM_CODES[exception.name] ?? exception.name,
      },
    });
  }
}
