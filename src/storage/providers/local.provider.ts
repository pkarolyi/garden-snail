import { Injectable } from '@nestjs/common';
import { createReadStream, createWriteStream } from 'fs';
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
}
