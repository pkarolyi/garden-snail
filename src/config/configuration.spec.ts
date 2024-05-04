import { describe, expect, it } from "vitest";
import { validate } from "./configuration";

const validConfigurationLocal = {
  AUTH_TOKENS: "token1,token2",
  STORAGE_PROVIDER: "local",
  LOCAL_STORAGE_PATH: "path",
};

const validConfigurationS3 = {
  AUTH_TOKENS: "token1,token2",
  STORAGE_PROVIDER: "s3",
  S3_BUCKET: "bucket",
  S3_ACCESS_KEY_ID: "accessKeyId",
  S3_SECRET_ACCESS_KEY: "secretAccessKey",
  S3_SESSION_TOKEN: "sessionToken",
  S3_REGION: "region",
  S3_FORCE_PATH_STYLE: "true",
  S3_ENDPOINT: "endpoint",
};

describe("Configuration", () => {
  describe("Local storage provider", () => {
    it("should parse valid configuration", () => {
      expect(() => validate(validConfigurationLocal)).not.toThrow();
    });

    it("should throw on invalid configuration", () => {
      expect(() => validate({})).toThrow();
      expect(() => validate({ STORAGE_PROVIDER: "local" })).toThrow();
      expect(() =>
        validate({ ...validConfigurationS3, STORAGE_PROVIDER: "local" }),
      ).toThrow();
    });

    it("should transform the configuration", () => {
      const configuration = validate(validConfigurationLocal);
      expect(configuration).toEqual({
        auth: {
          tokens: validConfigurationLocal.AUTH_TOKENS.split(","),
        },
        storage: {
          provider: validConfigurationLocal.STORAGE_PROVIDER,
          basePath: validConfigurationLocal.LOCAL_STORAGE_PATH,
        },
      });
    });
  });

  describe("S3 storage provider", () => {
    it("should parse valid configuration", () => {
      expect(() => validate(validConfigurationS3)).not.toThrow();
    });

    it("should throw on invalid configuration", () => {
      expect(() => validate({})).toThrow();
      expect(() => validate({ STORAGE_PROVIDER: "s3" })).toThrow();
      expect(() =>
        validate({ ...validConfigurationLocal, STORAGE_PROVIDER: "s3" }),
      ).toThrow();
    });

    it("should transform the configuration", () => {
      const configuration = validate(validConfigurationS3);
      expect(configuration).toEqual({
        auth: {
          tokens: validConfigurationS3.AUTH_TOKENS.split(","),
        },
        storage: {
          provider: validConfigurationS3.STORAGE_PROVIDER,
          bucket: validConfigurationS3.S3_BUCKET,
          credentials: {
            accessKeyId: validConfigurationS3.S3_ACCESS_KEY_ID,
            secretAccessKey: validConfigurationS3.S3_SECRET_ACCESS_KEY,
            sessionToken: validConfigurationS3.S3_SESSION_TOKEN,
          },
          region: validConfigurationS3.S3_REGION,
          endpoint: validConfigurationS3.S3_ENDPOINT,
          forcePathStyle: validConfigurationS3.S3_FORCE_PATH_STYLE === "true",
        },
      });
    });
  });
});
