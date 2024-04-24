import {
  BadRequestException,
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
    @Query('teamId') teamId: string,
    @Query('slug') slug: string, // slug is sometimes used instead of teamid
  ): Promise<void> {
    const team = teamId ?? slug;
    if (!team) throw new BadRequestException('Missing teamId or slug');

    const exists = await this.storageService.exists(team, hash);
    if (!exists) throw new NotFoundException('Artifact not found');
  }

  @Get(':hash')
  async getArtifact(
    @Param('hash') hash: string,
    @Query('teamId') teamId: string,
    @Query('slug') slug: string, // slug is sometimes used instead of teamid
  ): Promise<GetArtifactRO> {
    const team = teamId ?? slug;
    if (!team) throw new BadRequestException('Missing teamId or slug');

    const exists = await this.storageService.exists(team, hash);
    if (!exists) throw new NotFoundException('Artifact not found');

    const content = await this.storageService.read(team, hash);
    return new StreamableFile(content);
  }

  @Put(':hash')
  async putArtifact(
    @Param('hash') hash: string,
    @Body() body: Buffer,
    @Query('teamId') teamId: string,
    @Query('slug') slug: string, // slug is sometimes used instead of teamid
  ): Promise<PutArtifactRO> {
    const team = teamId ?? slug;
    if (!team) throw new BadRequestException('Missing teamId or slug');

    await this.storageService.write(team, hash, Readable.from(body));
    return { urls: [`${team}/${hash}`] };
  }

  @Post()
  @HttpCode(200)
  async queryArtifact(): Promise<void> {
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
