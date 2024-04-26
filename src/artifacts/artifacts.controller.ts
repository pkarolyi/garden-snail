import {
  Body,
  Controller,
  Get,
  Head,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { STORAGE_SERVICE } from 'src/storage/storage.constants';
import { StorageService } from 'src/storage/storage.interface';
import { Readable } from 'stream';
import { GetArtifactRO, PutArtifactRO, StatusRO } from './artifacts.interface';
import { ArtifactQueryTeamPipe } from './artifacts.pipe';

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
  async artifactExists(
    @Param('hash') hash: string,
    @Query(new ArtifactQueryTeamPipe()) team: string,
  ): Promise<void> {
    const exists = await this.storageService.exists(team, hash);
    if (!exists) throw new NotFoundException('Artifact not found');
  }

  @Get(':hash')
  async getArtifact(
    @Param('hash') hash: string,
    @Query(new ArtifactQueryTeamPipe()) team: string,
  ): Promise<GetArtifactRO> {
    const exists = await this.storageService.exists(team, hash);
    if (!exists) throw new NotFoundException('Artifact not found');

    const content = await this.storageService.read(team, hash);
    return new StreamableFile(content);
  }

  @Put(':hash')
  async putArtifact(
    @Param('hash') hash: string,
    @Query(new ArtifactQueryTeamPipe()) team: string,
    @Body() body: Buffer,
  ): Promise<PutArtifactRO> {
    await this.storageService.write(team, hash, Readable.from(body));
    return { urls: [`${team}/${hash}`] };
  }

  @Post()
  @HttpCode(501)
  queryArtifact(): void {
    // Documented in OpenAPI but currently unused
    return;
  }

  @Post('events')
  @HttpCode(200)
  postEvents(): void {
    // We currently dont't record any events
    return;
  }
}
