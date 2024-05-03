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
    this.logger.debug(`write params: ${JSON.stringify(params)}`);
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
    } catch {
      return false;
    }
    return true;
  }
}
