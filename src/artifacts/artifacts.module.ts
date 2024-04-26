import { Module } from "@nestjs/common";
import { StorageModule } from "src/storage/storage.module";
import { ArtifactsController } from "./artifacts.controller";

@Module({
  controllers: [ArtifactsController],
  imports: [StorageModule],
})
export class ArtifactsModule {}
