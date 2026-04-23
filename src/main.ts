/* c8 ignore start */
import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { validate } from "./config/configuration";

async function bootstrap() {
  const { server } = validate(process.env);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: server.bodyLimit }),
  );
  app.enableVersioning({ type: VersioningType.URI });
  app.useBodyParser("application/octet-stream");
  await app.listen(3000, "0.0.0.0");
}

bootstrap();
