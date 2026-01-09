import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ArtifactsModule } from "./artifacts/artifacts.module";
import { validate } from "./config/configuration";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ArtifactsModule,
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
  ],
})
export class AppModule {}
