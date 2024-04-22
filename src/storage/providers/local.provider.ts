import { Injectable } from '@nestjs/common';
import { createReadStream, createWriteStream } from 'fs';
import { access } from 'fs/promises';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { StorageService } from '../storage.interface';

@Injectable()
export class LocalStorageService implements StorageService {
  async write(hash: string, contents: Readable): Promise<void> {
    return pipeline(contents, createWriteStream(`blobs/${hash}`));
  }

  async read(hash: string): Promise<Readable> {
    return createReadStream(`blobs/${hash}`);
  }

  async exists(hash: string): Promise<boolean> {
    return access(`blobs/${hash}`)
      .then(() => true)
      .catch(() => false);
  }
}
