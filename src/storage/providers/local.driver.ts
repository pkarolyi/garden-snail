import { Injectable } from "@nestjs/common";
import { createReadStream, createWriteStream } from "fs";
import { access, mkdir } from "fs/promises";
import { join } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { StorageDriver } from "../storage.interface";

@Injectable()
export class LocalStorageDriver implements StorageDriver {
  constructor(private readonly basePath: string) {}

  async write(team: string, hash: string, contents: Readable): Promise<void> {
    await mkdir(join(this.basePath, team), { recursive: true });
    await pipeline(
      contents,
      createWriteStream(join(this.basePath, team, hash)),
    );
  }

  async read(team: string, hash: string): Promise<Readable> {
    return createReadStream(join(this.basePath, team, hash));
  }

  async exists(team: string, hash: string): Promise<boolean> {
    return access(join(this.basePath, team, hash))
      .then(() => true)
      .catch(() => false);
  }
}
