import { StreamableFile } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { StorageService } from "src/storage/storage.service";
import { Readable } from "stream";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArtifactsController } from "./artifacts.controller";

const testConfig = {
  provider: "local",
  basePath: "blobs",
};

describe("ArtifactsController", () => {
  let artifactsController: ArtifactsController;
  let storageService: StorageService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ArtifactsController],
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(() => testConfig),
          },
        },
      ],
    }).compile();

    artifactsController =
      moduleRef.get<ArtifactsController>(ArtifactsController);
    storageService = moduleRef.get<StorageService>(StorageService);
  });

  describe("getStatus", () => {
    it('should return {status: "enabled"}', () => {
      expect(artifactsController.getStatus()).toEqual({
        status: "enabled",
      });
    });
  });

  describe("artifactExists", () => {
    it("should throw if artifact doesn't exists", () => {
      vi.spyOn(storageService, "exists").mockImplementation(() =>
        Promise.resolve(false),
      );
      expect(
        artifactsController.artifactExists("hash", "teamId"),
      ).rejects.toThrow();
    });

    it("should not throw if artifact exists", () => {
      vi.spyOn(storageService, "exists").mockImplementation(() =>
        Promise.resolve(true),
      );
      expect(
        artifactsController.artifactExists("hash", "teamId"),
      ).resolves.not.toThrow();
    });
  });

  describe("getArtifact", () => {
    it("should throw if artifact doesn't exists", () => {
      vi.spyOn(storageService, "exists").mockImplementation(() =>
        Promise.resolve(false),
      );
      expect(
        artifactsController.getArtifact("hash", "teamId"),
      ).rejects.toThrow();
    });

    it("should return the stream if the artifact exists", async () => {
      const content = "test file contents";
      vi.spyOn(storageService, "exists").mockImplementation(() =>
        Promise.resolve(true),
      );
      vi.spyOn(storageService, "read").mockImplementation(() =>
        Promise.resolve(Readable.from(content)),
      );
      const result = await artifactsController.getArtifact("hash", "teamId");
      expect(result).toBeInstanceOf(StreamableFile);

      let receivedContent = "";
      for await (const data of result.getStream()) receivedContent += data;
      expect(receivedContent).toEqual(content);
    });
  });

  describe("putArtifact", () => {
    it("should write the file", async () => {
      const contents = "test file contents";
      const storageWrite = vi
        .spyOn(storageService, "write")
        .mockImplementation(() => Promise.resolve());
      const result = await artifactsController.putArtifact(
        "hash",
        "teamId",
        Buffer.from(contents),
      );
      expect(result).toEqual({ urls: ["teamId/hash"] });
      expect(storageWrite).toBeCalledWith(
        "teamId",
        "hash",
        expect.any(Readable),
      );
    });
  });

  describe("queryArtifact", () => {
    it("should not throw", () => {
      expect(() => artifactsController.queryArtifact()).not.toThrow();
    });
  });

  describe("postEvents", () => {
    it("should not throw", () => {
      expect(() => artifactsController.postEvents()).not.toThrow();
    });
  });
});
