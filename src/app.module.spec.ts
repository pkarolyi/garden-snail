import { Test } from '@nestjs/testing';
import { StorageModule } from 'src/storage/storage.module';
import { describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { ArtifactsModule } from './artifacts/artifacts.module';

describe('AppModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(ArtifactsModule)).toBeInstanceOf(ArtifactsModule);
    expect(module.get(StorageModule)).toBeInstanceOf(StorageModule);
  });
});
