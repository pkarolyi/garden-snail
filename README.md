# Garden Snail

Garden Snail is a self-hosted [Remote Cache](https://turbo.build/repo/docs/core-concepts/remote-caching#self-hosting) server for [Turborepo](https://turbo.build/repo) written in [NestJS](https://nestjs.com/).

## Getting started

The easiest way to get started is to use the published [Docker image](https://hub.docker.com/r/pkarolyi/garden-snail). It runs the remote cache server listening on port 3000. Currently only filesystem storage is available for the blobs and they are saved to `/garden-snail/blobs` in the container.

```sh
docker run -v "$(pwd)"/blobs:/garden-snail/blobs -p 3000:3000 pkarolyi/garden-snail
```

You can also build and run the application yourself, you will need NodeJS `^20.12` and pnpm `^9.0`:

```sh
pnpm install
pnpm build
node dist/main
```

## Notes

The `1.1.0` release is working and is compatible with the latest turborepo releases. Check the integration tests on the latest [workflow run](https://github.com/pkarolyi/garden-snail/actions/).

This version **does not include any authorization or rate limiting functionality**. It is intended for internal deployments in organizations with external access controls.

## Roadmap

These are the things I will be working on in the coming weeks in no particular order:

- Authorization
- Rate limiting
- More providers
  - Based on requests
