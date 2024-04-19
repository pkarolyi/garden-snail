import { Readable } from 'stream';

export interface StorageService {
  write(hash: string, contents: Readable): Promise<void>;
  read(hash: string): Promise<Readable>;
}
