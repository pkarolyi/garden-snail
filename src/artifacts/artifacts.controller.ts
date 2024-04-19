import { Controller, Get } from '@nestjs/common';
import { StatusRO } from './artifacts.interface';

@Controller({ path: 'artifacts', version: '8' })
export class ArtifactsController {
  @Get('status')
  getStatus(): StatusRO {
    return { status: 'enabled' };
  }
}
