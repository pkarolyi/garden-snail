import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { Readable } from "stream";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { LocalStorageDriver } from "./providers/local.driver";
import { S3StorageDriver } from "./providers/s3.driver";
import { StorageService } from "./storage.service";

vi.mock("./providers/local.driver");
vi.mock("./providers/s3.driver");

const testConfigLocal = {
  provider: "local",
  basePath: "blobs",
};

const testConfigS3 = {
  provider: "s3",
  bucket: "testBucket",
  credentials: {
    accessKeyId: "testAccessKeyId",
    secretAccessKey: "testSecretAccessKey",
  },
};

describe("StorageSerivice", () => {
  let storageService: StorageService;
  const testTeam = "team_test";
  const testHash = "hash_test";
  const testContent = Readable.from("test_content");

  beforeEach(async () => {
    (LocalStorageDriver as Mock).mockClear();
    (S3StorageDriver as Mock).mockClear();
  });

  describe("local storage", () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          {
            provide: ConfigService,
            useValue: {
              get: vi.fn(() => testConfigLocal),
            },
          },
        ],
      }).compile();

      storageService = module.get<StorageService>(StorageService);
    });

    it("should be defined", () => {
      expect(storageService).toBeDefined();
    });

    it("should pass write through to the driver", async () => {
      await storageService.write(testTeam, testHash, testContent);
      expect(
        (LocalStorageDriver as Mock).mock.instances[0].write,
      ).toHaveBeenCalledWith(testTeam, testHash, testContent);
    });

    it("should pass exists through to the driver", async () => {
      await storageService.exists(testTeam, testHash);
      expect(
        (LocalStorageDriver as Mock).mock.instances[0].exists,
      ).toHaveBeenCalledWith(testTeam, testHash);
    });

    it("should pass read through to the driver", async () => {
      await storageService.read(testTeam, testHash);
      expect(
        (LocalStorageDriver as Mock).mock.instances[0].read,
      ).toHaveBeenCalledWith(testTeam, testHash);
    });
  });

  describe("s3 storage", () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          {
            provide: ConfigService,
            useValue: {
              get: vi.fn(() => testConfigS3),
            },
          },
        ],
      }).compile();

      storageService = module.get<StorageService>(StorageService);
    });

    it("should be defined", () => {
      expect(storageService).toBeDefined();
    });

    it("should pass write through to the driver", async () => {
      await storageService.write(testTeam, testHash, testContent);
      expect(
        (S3StorageDriver as Mock).mock.instances[0].write,
      ).toHaveBeenCalledWith(testTeam, testHash, testContent);
    });

    it("should pass exists through to the driver", async () => {
      await storageService.exists(testTeam, testHash);
      expect(
        (S3StorageDriver as Mock).mock.instances[0].exists,
      ).toHaveBeenCalledWith(testTeam, testHash);
    });

    it("should pass read through to the driver", async () => {
      await storageService.read(testTeam, testHash);
      expect(
        (S3StorageDriver as Mock).mock.instances[0].read,
      ).toHaveBeenCalledWith(testTeam, testHash);
    });
  });
});
