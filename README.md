# Garden Snail

Garden Snail is a self-hosted [Remote Cache](https://turbo.build/repo/docs/core-concepts/remote-caching#self-hosting) server for [Turborepo](https://turbo.build/repo) written in [NestJS](https://nestjs.com/).

## Getting started

The easiest way to get started is to use the published [Docker image](https://hub.docker.com/r/pkarolyi/garden-snail). It runs the remote cache server listening on port 3000.

```sh
docker run -e STORAGE_PROVIDER=local -e LOCAL_STORAGE_PATH=/blobs -v "$(pwd)"/blobs:/blobs -p 3000:3000 pkarolyi/garden-snail
```

You can also build and run the application yourself, you will need NodeJS `20.12.2` and pnpm `9.0.6`:

```sh
pnpm install
pnpm build
node dist/main
```

### Environment variables

```sh
# required: comma separated list of valid tokens
AUTH_TOKENS=

# required: 's3' or 'local'
STORAGE_PROVIDER=

# Required if provider is local
LOCAL_STORAGE_PATH=

# Required if provider is s3
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# Optional if provider is s3
S3_REGION=
S3_SESSION_TOKEN=
S3_FORCE_PATH_STYLE=
S3_ENDPOINT=
```

## Notes

Check the integration tests on the [workflow runs](https://github.com/pkarolyi/garden-snail/actions/) for a given tag to check for compatibility.

The `1.1.0` release and releases prior to that **do not include any authorization or rate limiting functionality**.

## Roadmap

These are the things I will be working on in the coming weeks in no particular order:

- Rate limiting
- More providers
  - Based on requests
