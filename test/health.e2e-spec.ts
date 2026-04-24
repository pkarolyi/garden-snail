import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp, TestApp } from "./helpers";

describe("HealthController (e2e)", () => {
  let ctx: TestApp;

  beforeEach(async () => {
    ctx = await buildApp();
  });
  afterEach(async () => {
    await ctx.close();
  });

  it("GET /health returns 200 and { status: 'ok' } without auth", async () => {
    const result = await ctx.app.inject({ method: "GET", url: "/health" });
    expect(result.statusCode).toBe(200);
    expect(result.json()).toEqual({ status: "ok" });
  });
});
