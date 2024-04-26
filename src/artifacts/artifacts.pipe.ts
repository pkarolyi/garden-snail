import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from "@nestjs/common";

export class ArtifactQueryTeamPipe implements PipeTransform<any, string> {
  transform(value: any, metadata: ArgumentMetadata) {
    const team = value.teamId ?? value.slug; // sometimes slug is sent instead of teamId
    if (!team) throw new BadRequestException("Missing teamId or slug");
    return team;
  }
}
