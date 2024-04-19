import { Body, Controller, Get, Inject, Param, Put } from '@nestjs/common';
import { STORAGE_SERVICE } from 'src/storage/storage.constants';
import { StorageService } from 'src/storage/storage.interface';
import { Readable } from 'stream';
import { PutArtifactRO, StatusRO } from './artifacts.interface';

@Controller({ path: 'artifacts', version: '8' })
export class ArtifactsController {
  constructor(
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService,
  ) {}

  @Get('status')
  getStatus(): StatusRO {
    return { status: 'enabled' };
  }

  @Put(':hash')
  putArtifact(
    @Param('hash') hash: string,
    @Body() body: Buffer,
  ): PutArtifactRO {
    this.storageService.write(hash, Readable.from(body));
    return { urls: [`http://localhost:3000/v8/artifacts/${hash}`] };
  }
}
