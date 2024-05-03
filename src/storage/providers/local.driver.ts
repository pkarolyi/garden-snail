import { Injectable, Logger } from "@nestjs/common";
import { createReadStream, createWriteStream } from "fs";
import { access, mkdir } from "fs/promises";
import { join } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { StorageDriver } from "../storage.interface";

@Injectable()
export class LocalStorageDriver implements StorageDriver {
  private readonly logger = new Logger(LocalStorageDriver.name);

  constructor(private readonly basePath: string) {}

  async write(team: string, hash: string, contents: Readable): Promise<void> {
    this.logger.debug(`write path: ${join(this.basePath, team, hash)}`);
    await mkdir(join(this.basePath, team), { recursive: true });
    await pipeline(
      contents,
      createWriteStream(join(this.basePath, team, hash)),
    );
  }

  async read(team: string, hash: string): Promise<Readable> {
    this.logger.debug(`read path: ${join(this.basePath, team, hash)}`);
    return createReadStream(join(this.basePath, team, hash));
  }

  async exists(team: string, hash: string): Promise<boolean> {
    this.logger.debug(`exists path: ${join(this.basePath, team, hash)}`);
    return access(join(this.basePath, team, hash))
      .then(() => true)
      .catch(() => false);
  }
}
