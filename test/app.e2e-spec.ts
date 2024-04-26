import { VersioningType } from "@nestjs/common";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { AllExceptionFilter } from "src/all-exceptions.filter";
import { HttpExceptionFilter } from "src/http-exception.filter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.enableVersioning({
      type: VersioningType.URI,
    });
    app.useGlobalFilters(new AllExceptionFilter());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useBodyParser("application/octet-stream");

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("/v8/artifacts/status (GET)", async () => {
    const result = await app.inject({
      method: "GET",
      url: "/v8/artifacts/status",
    });
    expect(result.statusCode).toEqual(200);
    expect(result.json()).toEqual({ status: "enabled" });
  });
});
