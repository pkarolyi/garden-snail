import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Injectable, Logger } from "@nestjs/common";
import { Readable } from "stream";
import { StorageDriver } from "../storage.interface";

@Injectable()
export class S3StorageDriver implements StorageDriver {
  private readonly logger = new Logger(S3StorageDriver.name);

  constructor(
    private readonly bucket: string,
    private readonly s3Client: S3Client,
  ) {}

  async write(team: string, hash: string, contents: Readable): Promise<void> {
    const params = {
      Body: contents,
      Bucket: this.bucket,
      Key: `${team}/${hash}`,
    };
    this.logger.debug(`write bucket: ${params.Bucket} key: ${params.Key}`);
    const upload = new Upload({ client: this.s3Client, params });
    await upload.done();
  }

  async read(team: string, hash: string): Promise<Readable> {
    const params = {
      Bucket: this.bucket,
      Key: `${team}/${hash}`,
    };
    this.logger.debug(`read params: ${JSON.stringify(params)}`);
    const getCommand = new GetObjectCommand(params);
    const response = await this.s3Client.send(getCommand);
    return response.Body as Readable;
  }

  async exists(team: string, hash: string): Promise<boolean> {
    const params = {
      Bucket: this.bucket,
      Key: `${team}/${hash}`,
    };
    this.logger.debug(`exists params: ${JSON.stringify(params)}`);
    const headCommand = new HeadObjectCommand(params);
    try {
      await this.s3Client.send(headCommand);
      return true;
    } catch (error) {
      if (isS3NotFoundError(error)) return false;
      this.logger.error(
        `exists failed for ${params.Key}: ${errorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}

function isS3NotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return e.name === "NotFound" || e.$metadata?.httpStatusCode === 404;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
