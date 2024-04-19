import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 1024 * 1024 * 1024 }), // 1GiB limit
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useBodyParser('application/octet-stream');
  await app.listen(3000);
}
bootstrap();
