import { Module } from '@nestjs/common';
import { ArtifactsModule } from './artifacts/artifacts.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [ArtifactsModule, StorageModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
