import { Test } from '@nestjs/testing';
import { StorageModule } from 'src/storage/storage.module';
import { describe, expect, it } from 'vitest';
import { ArtifactsController } from './artifacts.controller';
import { ArtifactsModule } from './artifacts.module';

describe('ArtifactsModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [ArtifactsModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(ArtifactsController)).toBeInstanceOf(ArtifactsController);
    expect(module.get(StorageModule)).toBeInstanceOf(StorageModule);
  });
});
