import { Injectable } from "@nestjs/common";
import { createReadStream, createWriteStream } from "fs";
import { access, mkdir } from "fs/promises";
import { join } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { StorageService } from "../storage.interface";

@Injectable()
export class LocalStorageService implements StorageService {
  async write(team: string, hash: string, contents: Readable): Promise<void> {
    await mkdir(join("blobs", team), { recursive: true });
    await pipeline(contents, createWriteStream(join("blobs", team, hash)));
  }

  async read(team: string, hash: string): Promise<Readable> {
    return createReadStream(join("blobs", team, hash));
  }

  async exists(team: string, hash: string): Promise<boolean> {
    return access(join("blobs", team, hash))
      .then(() => true)
      .catch(() => false);
  }
}
