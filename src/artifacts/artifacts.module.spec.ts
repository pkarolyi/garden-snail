import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";
import { ArtifactsController } from "./artifacts.controller";
import { ArtifactsModule } from "./artifacts.module";

const testConfig = {
  storage: {
    provider: "local",
    basePath: "blobs",
  },
};

describe("ArtifactsModule", () => {
  it("should compile the module", async () => {
    const module = await Test.createTestingModule({
      imports: [
        ArtifactsModule,
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          load: [() => testConfig],
        }),
      ],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(ArtifactsController)).toBeInstanceOf(ArtifactsController);
  });
});
