import { StreamableFile } from '@nestjs/common';

export type StatusRO = {
  status: 'disabled' | 'enabled' | 'over_limit' | 'paused';
};

export type PutArtifactRO = {
  urls: string[];
};

export type GetArtifactRO = StreamableFile;
