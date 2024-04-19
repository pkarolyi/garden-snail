import { Module } from '@nestjs/common';
import { STORAGE_SERVICE } from './storage.constants';
import { storageProvider } from './storage.provider';

@Module({ providers: [storageProvider], exports: [STORAGE_SERVICE] })
export class StorageModule {}
