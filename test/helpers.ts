import { VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { AppModule } from "../src/app.module";
import { ConfigurationSchema } from "../src/config/configuration";
import { registerStreamingOctetStreamParser } from "../src/streaming-body";

export type TestApp = {
  app: NestFastifyApplication;
  storagePath: string;
  close: () => Promise<void>;
};

export type BuildAppOptions = {
  envOverrides?: Record<string, string>;
  /**
   * Overrides the Fastify bodyLimit directly. ConfigModule.forRoot runs
   * validate(process.env) at AppModule class-decoration time, so mutating
   * process.env.BODY_LIMIT between tests has no effect. Pass this instead
   * when a test needs a specific limit.
   */
  bodyLimit?: number;
};

export async function buildApp(
  options: BuildAppOptions = {},
): Promise<TestApp> {
  const { envOverrides = {}, bodyLimit } = options;
  const storagePath = await mkdtemp(join(tmpdir(), "gs-e2e-"));

  const priorEnv: Record<string, string | undefined> = {};
  const applied: Record<string, string> = {
    LOCAL_STORAGE_PATH: storagePath,
    ...envOverrides,
  };
  for (const [k, v] of Object.entries(applied)) {
    priorEnv[k] = process.env[k];
    process.env[k] = v;
  }

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const configService =
    moduleFixture.get<ConfigService<ConfigurationSchema, true>>(ConfigService);
  const server = configService.get("server", { infer: true });

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({ bodyLimit: bodyLimit ?? server.bodyLimit }),
  );
  app.enableVersioning({ type: VersioningType.URI });
  registerStreamingOctetStreamParser(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return {
    app,
    storagePath,
    close: async () => {
      await app.close();
      await rm(storagePath, { recursive: true, force: true });
      for (const [k, v] of Object.entries(priorEnv)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
    },
  };
}
