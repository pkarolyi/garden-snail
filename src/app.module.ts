import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ArtifactsModule } from "./artifacts/artifacts.module";
import { validate } from "./config/configuration";

@Module({
  imports: [
    ArtifactsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
  ],
})
export class AppModule {}
