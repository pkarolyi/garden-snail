import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { LocalStorageService } from './providers/local.provider';
import { STORAGE_SERVICE } from './storage.constants';
import { StorageModule } from './storage.module';

describe('StorageModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [StorageModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(STORAGE_SERVICE)).toBeInstanceOf(LocalStorageService);
  });
});
