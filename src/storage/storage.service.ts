import { S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConfigurationSchema } from "src/config/configuration";
import { Readable } from "stream";
import { LocalStorageDriver } from "./providers/local.driver";
import { S3StorageDriver } from "./providers/s3.driver";
import { StorageDriver } from "./storage.interface";

@Injectable()
export class StorageService {
  private readonly driver: StorageDriver;

  constructor(
    readonly configService: ConfigService<ConfigurationSchema, true>,
  ) {
    const storageConfig = configService.get("storage", { infer: true });

    if (storageConfig.provider === "local") {
      const { basePath } = storageConfig;
      this.driver = new LocalStorageDriver(basePath);
    } else if (storageConfig.provider === "s3") {
      const { bucket, credentials, region, forcePathStyle } = storageConfig;
      const s3Client = new S3Client({ credentials, region, forcePathStyle });
      this.driver = new S3StorageDriver(bucket, s3Client);
    }
  }

  write(team: string, hash: string, contents: Readable): Promise<void> {
    return this.driver.write(team, hash, contents);
  }

  read(team: string, hash: string): Promise<Readable> {
    return this.driver.read(team, hash);
  }

  exists(team: string, hash: string): Promise<boolean> {
    return this.driver.exists(team, hash);
  }
}
