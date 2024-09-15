import { S3Client } from "@aws-sdk/client-s3";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ConfigurationSchema,
  isS3KeyAuthCredentials,
} from "src/config/configuration";
import { Readable } from "stream";
import { LocalStorageDriver } from "./providers/local.driver";
import { S3StorageDriver } from "./providers/s3.driver";
import { StorageDriver } from "./storage.interface";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: StorageDriver;

  constructor(
    readonly configService: ConfigService<ConfigurationSchema, true>,
  ) {
    const storageConfig = configService.get("storage", { infer: true });

    if (storageConfig.provider === "local") {
      const { basePath } = storageConfig;
      this.driver = new LocalStorageDriver(basePath);
    } else if (storageConfig.provider === "s3") {
      const { bucket, credentials, region, forcePathStyle, endpoint } =
        storageConfig;

      if (isS3KeyAuthCredentials(credentials)) {
        const s3Client = new S3Client({
          credentials,
          region,
          forcePathStyle,
          endpoint,
        });
        this.driver = new S3StorageDriver(bucket, s3Client);
      } else {
        const s3Client = new S3Client({
          region,
          forcePathStyle,
          endpoint,
        });
        this.driver = new S3StorageDriver(bucket, s3Client);
      }
    }
  }

  write(team: string, hash: string, contents: Readable): Promise<void> {
    this.logger.debug(`write team: ${team} hash: ${hash}`);
    return this.driver.write(team, hash, contents);
  }

  read(team: string, hash: string): Promise<Readable> {
    this.logger.debug(`read team: ${team} hash: ${hash}`);
    return this.driver.read(team, hash);
  }

  exists(team: string, hash: string): Promise<boolean> {
    this.logger.debug(`exists team: ${team} hash: ${hash}`);
    return this.driver.exists(team, hash);
  }
}
