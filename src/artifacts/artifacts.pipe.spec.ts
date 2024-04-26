import { ArgumentMetadata } from "@nestjs/common";
import { beforeEach, describe, expect, it } from "vitest";
import { ArtifactQueryTeamPipe } from "./artifacts.pipe";

describe("ArtifactQueryTeamPipe", () => {
  let artifactQueryTeamPipe: ArtifactQueryTeamPipe;
  const metadata: ArgumentMetadata = {
    type: "query",
    data: "",
  };

  beforeEach(() => {
    artifactQueryTeamPipe = new ArtifactQueryTeamPipe();
  });

  it("should return the teamId if passed teamId", () => {
    const query = {
      teamId: "test-teamId",
    };
    expect(artifactQueryTeamPipe.transform(query, metadata)).toEqual(
      "test-teamId",
    );
  });

  it("should return the slug if passed slug", () => {
    const query = {
      slug: "test-slugTeamId",
    };
    expect(artifactQueryTeamPipe.transform(query, metadata)).toEqual(
      "test-slugTeamId",
    );
  });

  it("should return the teamId if passed both teamId and slug", () => {
    const query = {
      teamId: "test-teamId",
      slug: "test-slugTeamId",
    };
    expect(artifactQueryTeamPipe.transform(query, metadata)).toEqual(
      "test-teamId",
    );
  });

  it("should throw on invalid data", () => {
    const query = {
      invalid: "data",
    };
    expect(() => artifactQueryTeamPipe.transform(query, metadata)).toThrow();
  });
});
