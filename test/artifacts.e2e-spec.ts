import { createHash, randomBytes } from "crypto";
import { AddressInfo } from "net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp, TestApp } from "./helpers";

const TOKEN = "token";
const TEAM = "test-team";
const OCTET = "application/octet-stream";

const auth = { authorization: `Bearer ${TOKEN}` };
const putHeaders = { ...auth, "content-type": OCTET };

function sha256(b: Buffer): string {
  return createHash("sha256").update(b).digest("hex");
}

describe("ArtifactsController (e2e)", () => {
  let ctx: TestApp;

  beforeEach(async () => {
    ctx = await buildApp();
  });
  afterEach(async () => {
    await ctx.close();
  });

  describe("GET /v8/artifacts/status", () => {
    it("returns 200 and { status: 'enabled' }", async () => {
      const result = await ctx.app.inject({
        method: "GET",
        url: "/v8/artifacts/status",
        headers: auth,
      });
      expect(result.statusCode).toBe(200);
      expect(result.json()).toEqual({ status: "enabled" });
    });
  });

  describe("PUT /v8/artifacts/:hash", () => {
    it("returns 202 and the expected url list", async () => {
      const hash = "put-hash";
      const body = Buffer.from("artifact payload");
      const result = await ctx.app.inject({
        method: "PUT",
        url: `/v8/artifacts/${hash}?teamId=${TEAM}`,
        headers: putHeaders,
        payload: body,
      });
      expect(result.statusCode).toBe(202);
      expect(result.json()).toEqual({ urls: [`${TEAM}/${hash}`] });
    });

    it("returns 400 when teamId and slug are both missing", async () => {
      const result = await ctx.app.inject({
        method: "PUT",
        url: "/v8/artifacts/hash",
        headers: putHeaders,
        payload: Buffer.from("x"),
      });
      expect(result.statusCode).toBe(400);
    });
  });

  describe("HEAD /v8/artifacts/:hash", () => {
    it("returns 200 when the artifact exists", async () => {
      const hash = "head-hash";
      await ctx.app.inject({
        method: "PUT",
        url: `/v8/artifacts/${hash}?teamId=${TEAM}`,
        headers: putHeaders,
        payload: Buffer.from("x"),
      });

      const result = await ctx.app.inject({
        method: "HEAD",
        url: `/v8/artifacts/${hash}?teamId=${TEAM}`,
        headers: auth,
      });
      expect(result.statusCode).toBe(200);
    });

    it("returns 404 when the artifact is missing", async () => {
      const result = await ctx.app.inject({
        method: "HEAD",
        url: `/v8/artifacts/missing?teamId=${TEAM}`,
        headers: auth,
      });
      expect(result.statusCode).toBe(404);
    });

    it("returns 400 when teamId and slug are both missing", async () => {
      const result = await ctx.app.inject({
        method: "HEAD",
        url: "/v8/artifacts/hash",
        headers: auth,
      });
      expect(result.statusCode).toBe(400);
    });
  });

  describe("GET /v8/artifacts/:hash", () => {
    it("returns the stored bytes", async () => {
      const hash = "get-hash";
      const body = Buffer.from("payload body here");
      await ctx.app.inject({
        method: "PUT",
        url: `/v8/artifacts/${hash}?teamId=${TEAM}`,
        headers: putHeaders,
        payload: body,
      });

      const result = await ctx.app.inject({
        method: "GET",
        url: `/v8/artifacts/${hash}?teamId=${TEAM}`,
        headers: auth,
      });
      expect(result.statusCode).toBe(200);
      expect(Buffer.from(result.rawPayload).equals(body)).toBe(true);
    });

    it("returns 404 when the artifact is missing", async () => {
      const result = await ctx.app.inject({
        method: "GET",
        url: `/v8/artifacts/missing?teamId=${TEAM}`,
        headers: auth,
      });
      expect(result.statusCode).toBe(404);
    });

    it("accepts slug as an alias for teamId", async () => {
      const hash = "slug-hash";
      const body = Buffer.from("via slug");
      await ctx.app.inject({
        method: "PUT",
        url: `/v8/artifacts/${hash}?slug=${TEAM}`,
        headers: putHeaders,
        payload: body,
      });
      const result = await ctx.app.inject({
        method: "GET",
        url: `/v8/artifacts/${hash}?slug=${TEAM}`,
        headers: auth,
      });
      expect(result.statusCode).toBe(200);
      expect(Buffer.from(result.rawPayload).equals(body)).toBe(true);
    });
  });

  describe("POST /v8/artifacts", () => {
    it("returns 501", async () => {
      const result = await ctx.app.inject({
        method: "POST",
        url: "/v8/artifacts",
        headers: auth,
      });
      expect(result.statusCode).toBe(501);
    });
  });

  describe("POST /v8/artifacts/events", () => {
    it("returns 200", async () => {
      const result = await ctx.app.inject({
        method: "POST",
        url: "/v8/artifacts/events",
        headers: { ...auth, "content-type": "application/json" },
        payload: [],
      });
      expect(result.statusCode).toBe(200);
    });
  });

  describe("auth guard", () => {
    it("returns 403 when the Authorization header is missing", async () => {
      const result = await ctx.app.inject({
        method: "GET",
        url: "/v8/artifacts/status",
      });
      expect(result.statusCode).toBe(403);
    });

    it("returns 403 when the token is wrong", async () => {
      const result = await ctx.app.inject({
        method: "GET",
        url: "/v8/artifacts/status",
        headers: { authorization: "Bearer not-the-token" },
      });
      expect(result.statusCode).toBe(403);
    });

    it("returns 403 when the header is malformed", async () => {
      const result = await ctx.app.inject({
        method: "GET",
        url: "/v8/artifacts/status",
        headers: { authorization: "token" },
      });
      expect(result.statusCode).toBe(403);
    });

    it("guards mutating routes too", async () => {
      const result = await ctx.app.inject({
        method: "PUT",
        url: `/v8/artifacts/hash?teamId=${TEAM}`,
        headers: { "content-type": OCTET },
        payload: Buffer.from("x"),
      });
      expect(result.statusCode).toBe(403);
    });
  });

  describe("URI versioning", () => {
    it("returns 404 for unversioned artifact paths", async () => {
      const result = await ctx.app.inject({
        method: "GET",
        url: "/artifacts/status",
        headers: auth,
      });
      expect(result.statusCode).toBe(404);
    });
  });

  describe("streaming and roundtrip", () => {
    it("round-trips a 1 MB random payload byte-for-byte", async () => {
      const hash = "roundtrip-hash";
      const body = randomBytes(1024 * 1024);

      const put = await ctx.app.inject({
        method: "PUT",
        url: `/v8/artifacts/${hash}?teamId=${TEAM}`,
        headers: putHeaders,
        payload: body,
      });
      expect(put.statusCode).toBe(202);

      const get = await ctx.app.inject({
        method: "GET",
        url: `/v8/artifacts/${hash}?teamId=${TEAM}`,
        headers: auth,
      });
      expect(get.statusCode).toBe(200);
      expect(sha256(Buffer.from(get.rawPayload))).toBe(sha256(body));
    });

    it("keeps teams isolated for the same hash", async () => {
      const hash = "shared-hash";
      const bodyA = Buffer.from("team A contents");
      const bodyB = Buffer.from("team B contents");

      await ctx.app.inject({
        method: "PUT",
        url: `/v8/artifacts/${hash}?teamId=team-a`,
        headers: putHeaders,
        payload: bodyA,
      });
      await ctx.app.inject({
        method: "PUT",
        url: `/v8/artifacts/${hash}?teamId=team-b`,
        headers: putHeaders,
        payload: bodyB,
      });

      const getA = await ctx.app.inject({
        method: "GET",
        url: `/v8/artifacts/${hash}?teamId=team-a`,
        headers: auth,
      });
      const getB = await ctx.app.inject({
        method: "GET",
        url: `/v8/artifacts/${hash}?teamId=team-b`,
        headers: auth,
      });
      expect(Buffer.from(getA.rawPayload).equals(bodyA)).toBe(true);
      expect(Buffer.from(getB.rawPayload).equals(bodyB)).toBe(true);
    });
  });
});

describe("ArtifactsController (e2e) — body limit", () => {
  let ctx: TestApp;
  let baseUrl: string;

  beforeEach(async () => {
    ctx = await buildApp({ bodyLimit: 1024 });
    // bodyLimit enforcement only kicks in on a real socket — app.inject
    // bypasses the request stream path entirely.
    await ctx.app.listen(0, "127.0.0.1");
    const { port } = ctx.app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });
  afterEach(async () => {
    await ctx.close();
  });

  it("rejects PUT with Content-Length above BODY_LIMIT", async () => {
    const res = await fetch(`${baseUrl}/v8/artifacts/hash?teamId=${TEAM}`, {
      method: "PUT",
      headers: { ...auth, "content-type": OCTET },
      body: randomBytes(2048),
    });
    expect(res.status).toBe(413);
  });

  it("rejects chunked PUT whose body exceeds BODY_LIMIT mid-stream", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(randomBytes(512)));
        controller.enqueue(new Uint8Array(randomBytes(512)));
        controller.enqueue(new Uint8Array(randomBytes(512)));
        controller.enqueue(new Uint8Array(randomBytes(512)));
        controller.close();
      },
    });
    const res = await fetch(`${baseUrl}/v8/artifacts/hash?teamId=${TEAM}`, {
      method: "PUT",
      headers: { ...auth, "content-type": OCTET },
      body: stream,
      // duplex is required for streaming request bodies in Node's fetch
      duplex: "half",
    } as RequestInit & { duplex: "half" });
    expect(res.status).toBe(413);
  });

  it("accepts PUT bodies within BODY_LIMIT", async () => {
    const res = await fetch(`${baseUrl}/v8/artifacts/hash?teamId=${TEAM}`, {
      method: "PUT",
      headers: { ...auth, "content-type": OCTET },
      body: randomBytes(512),
    });
    expect(res.status).toBe(202);
  });
});
