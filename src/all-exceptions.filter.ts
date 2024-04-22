import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    console.error(request.routeOptions.url, ':', exception);

    response.status(500).send({
      error: {
        message: 'Internal Server Error',
        code: 'internal_server_error',
      },
    });
  }
}
