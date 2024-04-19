import { Module } from '@nestjs/common';
import { ArtifactsModule } from './artifacts/artifacts.module';

@Module({
  imports: [ArtifactsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
