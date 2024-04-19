import { Module } from '@nestjs/common';
import { ArtifactsController } from './artifacts.controller';

@Module({
  controllers: [ArtifactsController],
})
export class ArtifactsModule {}
