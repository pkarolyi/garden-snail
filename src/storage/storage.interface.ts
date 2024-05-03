import { Readable } from "stream";

export interface StorageDriver {
  write(team: string, hash: string, contents: Readable): Promise<void>;
  read(team: string, hash: string): Promise<Readable>;
  exists(team: string, hash: string): Promise<boolean>;
}
