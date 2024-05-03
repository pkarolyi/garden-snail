import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { StorageService } from "./storage.service";

@Module({
  providers: [StorageService, ConfigService],
  exports: [StorageService],
  imports: [ConfigModule],
})
export class StorageModule {}
