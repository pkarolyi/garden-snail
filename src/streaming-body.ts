import { PayloadTooLargeException } from "@nestjs/common";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Transform } from "stream";

/**
 * Streams `application/octet-stream` request bodies through as `request.body`
 * instead of buffering. Custom streaming parsers skip Fastify's built-in
 * `bodyLimit` check, so it's reinstated here: reject upfront on an oversized
 * `Content-Length`, tear down mid-flight if the running byte count crosses it.
 */
export function registerStreamingOctetStreamParser(
  app: NestFastifyApplication,
): void {
  const fastify = app.getHttpAdapter().getInstance();
  const bodyLimit = fastify.initialConfig.bodyLimit!;

  fastify.addContentTypeParser(
    "application/octet-stream",
    (req, payload, done) => {
      const contentLength = Number(req.headers["content-length"]);
      if (Number.isFinite(contentLength) && contentLength > bodyLimit) {
        const err = Object.assign(new Error("Request body is too large"), {
          statusCode: 413,
          code: "FST_ERR_CTP_BODY_TOO_LARGE",
        });
        return done(err, undefined);
      }

      let received = 0;
      const limiter = new Transform({
        transform(chunk, _enc, cb) {
          received += Buffer.byteLength(chunk);
          if (received > bodyLimit) {
            return cb(new PayloadTooLargeException());
          }
          cb(null, chunk);
        },
      });
      payload.on("error", (err) => limiter.destroy(err));
      // Keep the request stream alive on overflow so Nest can write the 413
      // back on the same connection; silently drain the rest of the body so
      // the socket closes cleanly once the client finishes sending.
      limiter.on("error", () => {
        payload.unpipe(limiter);
        payload.on("data", () => undefined);
        payload.on("error", () => undefined);
      });
      payload.pipe(limiter);
      done(null, limiter);
    },
  );
}
