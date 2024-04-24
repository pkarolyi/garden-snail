import { Readable } from 'stream';

export type Meta = {
  size: number;
  taskDurationMs: number;
};

export interface StorageService {
  write(team: string, hash: string, contents: Readable): Promise<void>;
  read(team: string, key: string): Promise<Readable>;
  exists(team: string, key: string): Promise<boolean>;
}
