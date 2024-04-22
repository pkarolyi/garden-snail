import {
  Body,
  Controller,
  Get,
  Head,
  Inject,
  NotFoundException,
  Param,
  Put,
  StreamableFile,
} from '@nestjs/common';
import { STORAGE_SERVICE } from 'src/storage/storage.constants';
import { StorageService } from 'src/storage/storage.interface';
import { Readable } from 'stream';
import {
  GetArtifactRO,
  HeadArtifactRO,
  PutArtifactRO,
  StatusRO,
} from './artifacts.interface';

@Controller({ path: 'artifacts', version: '8' })
export class ArtifactsController {
  constructor(
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService,
  ) {}

  @Get('status')
  getStatus(): StatusRO {
    return { status: 'enabled' };
  }

  @Head(':hash')
  async artifactExists(@Param('hash') hash: string): Promise<HeadArtifactRO> {
    const exists = await this.storageService.exists(hash);
    if (!exists) throw new NotFoundException('Artifact not found');
  }

  @Get(':hash')
  async getArtifact(@Param('hash') hash: string): Promise<GetArtifactRO> {
    const exists = await this.storageService.exists(hash);
    if (!exists) throw new NotFoundException('Artifact not found');
    const content = await this.storageService.read(hash);
    return new StreamableFile(content);
  }

  @Put(':hash')
  async putArtifact(
    @Param('hash') hash: string,
    @Body() body: Buffer,
  ): Promise<PutArtifactRO> {
    await this.storageService.write(hash, Readable.from(body));
    return { urls: [`http://localhost:3000/v8/artifacts/${hash}`] };
  }
}
