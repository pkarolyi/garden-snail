import { BadRequestException, Logger, PipeTransform } from "@nestjs/common";

export class ArtifactQueryTeamPipe implements PipeTransform<any, string> {
  private readonly logger = new Logger(ArtifactQueryTeamPipe.name);

  transform(value: any) {
    this.logger.debug(`value: ${JSON.stringify(value)}`);
    const team = value.teamId ?? value.slug; // sometimes slug is sent instead of teamId
    if (!team) throw new BadRequestException("Missing teamId or slug");
    return team;
  }
}
