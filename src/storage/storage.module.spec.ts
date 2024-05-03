import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";
import { StorageModule } from "./storage.module";
import { StorageService } from "./storage.service";

const testConfig = {
  storage: {
    provider: "local",
    basePath: "blobs",
  },
};

describe("StorageModule", () => {
  it("should compile the module", async () => {
    const module = await Test.createTestingModule({
      imports: [
        StorageModule,
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          load: [() => testConfig],
        }),
      ],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(StorageService)).toBeInstanceOf(StorageService);
  });
});
