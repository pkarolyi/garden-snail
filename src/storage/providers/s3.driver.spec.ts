import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { S3StorageDriver } from "./s3.driver";

const mockSend = vi.fn();
const mockUploadDone = vi.fn();

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(),
  GetObjectCommand: vi.fn(),
  HeadObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/lib-storage", () => ({
  Upload: vi.fn().mockImplementation(() => ({
    done: mockUploadDone,
  })),
}));

describe("S3StorageDriver", () => {
  let driver: S3StorageDriver;
  const bucket = "test-bucket";
  const team = "team_test";
  const hash = "abc123";

  beforeEach(() => {
    vi.clearAllMocks();
    const mockS3Client = { send: mockSend };
    driver = new S3StorageDriver(bucket, mockS3Client as never);
  });

  describe("write", () => {
    it("should upload content to S3 with correct key", async () => {
      const content = Readable.from(Buffer.from("test content"));

      await driver.write(team, hash, content);

      expect(mockUploadDone).toHaveBeenCalledOnce();
    });
  });

  describe("read", () => {
    it("should return the object body as a readable stream", async () => {
      const expectedBody = Readable.from(Buffer.from("cached content"));
      mockSend.mockResolvedValueOnce({ Body: expectedBody });

      const result = await driver.read(team, hash);

      expect(mockSend).toHaveBeenCalledOnce();
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: bucket,
        Key: `${team}/${hash}`,
      });
      expect(result).toBe(expectedBody);
    });
  });

  describe("exists", () => {
    it("should return true when object exists", async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await driver.exists(team, hash);

      expect(mockSend).toHaveBeenCalledOnce();
      expect(HeadObjectCommand).toHaveBeenCalledWith({
        Bucket: bucket,
        Key: `${team}/${hash}`,
      });
      expect(result).toBe(true);
    });

    it("should return false when object does not exist", async () => {
      mockSend.mockRejectedValueOnce(new Error("NotFound"));

      const result = await driver.exists(team, hash);

      expect(mockSend).toHaveBeenCalledOnce();
      expect(result).toBe(false);
    });
  });
});
