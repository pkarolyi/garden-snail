# Garden Snail

![Compatible with turborepo 1.13](https://img.shields.io/badge/turborepo-1.13-blue?style=for-the-badge&logo=turborepo&logoColor=white) ![Compatible with turborepo 2.x](https://img.shields.io/badge/turborepo-2.x-blue?style=for-the-badge&logo=turborepo&logoColor=white)

Garden Snail is a self-hosted [Remote Cache](https://turbo.build/repo/docs/core-concepts/remote-caching#self-hosting) server for [Turborepo](https://turbo.build/repo) written in [NestJS](https://nestjs.com/). It serves as a drop-in replacement for Vercel's remote cache and supports storing the artifacts locally or in a s3 compatible storage.

## Getting started

The easiest way to get started is to use the published [Docker image](https://hub.docker.com/r/pkarolyi/garden-snail). It runs the remote cache server listening on port 3000.

```sh
docker run \
-e AUTH_TOKENS=change_this \
-e STORAGE_PROVIDER=local \
-e LOCAL_STORAGE_PATH=blobs \
-v "$(pwd)"/blobs:/garden-snail/blobs \
-p 3000:3000 \
pkarolyi/garden-snail
```

You can also build and run the application yourself, you will need NodeJS `20.15.1` and pnpm `9.5.0`:

```sh
pnpm install
pnpm build
node dist/main
```

## Environment variables

```sh
# required: comma separated list of valid tokens (do not include spaces), eg. "token1,token2,token3"
AUTH_TOKENS=

# required: "s3" or "local"
STORAGE_PROVIDER=

# required if provider is local, eg. "blobs" will point to /garden-snail/blobs in the container
LOCAL_STORAGE_PATH=

# required if provider is s3
S3_BUCKET=

# optional if provider is s3
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=
S3_SESSION_TOKEN=
S3_FORCE_PATH_STYLE=
S3_ENDPOINT=
```

## Configuring Turborepo to use your cache server

### Quick start

You will need to [configure Turborepo](https://turbo.build/repo/docs/core-concepts/remote-caching#self-hosting) to use your self-hosted remote cache server. The fastest option for checking that the server worked is by running the following command, note that the `team` option must start with `team_`:

```sh
turbo run build --api="https://my-server.example.com" --team "team_xxxx" --token="a_valid_auth_token"
```

If you see "remote caching enabled" printed that means that it is using the cache. Also you should see some logs from the remote cache server.

After running the build once, delete the local cache files (`node_modules/.cache` for `turbo@1` and `.turbo/cache` for `turbo@2` and if you are using NextJs then also `.next`) and running the build again without any changes. You should see "FULL TURBO" printed as Turborepo uses your remote cache to download the artifacts instead of building them again.

### Long-term setup

This cli flag version however is not the best as it exposes your token in your shell's history. You should preferably use [environment variables](https://turbo.build/repo/docs/reference/system-variables) to configure Turborepo:

```sh
# Set the base URL for Remote Cache.
TURBO_API=

# Your team id (must start with "team_")
TURBO_TEAMID=

# One of the tokens from the server's "AUTH_TOKENS"
TURBO_TOKEN=

# If you are on a slow connection you may need to set this (timeout is in seconds, defaults to 60)
TURBO_REMOTE_CACHE_TIMEOUT=
```

If you used Vercel's remote cache before, remove `.turbo/config.json` to make sure those settings won't interfere with the custom remote cache.

In the current version any valid AUTH_TOKEN has acess to any team, so **don't use teams for access control**.

## Storage Options

You can choose between `local` and `s3` storage for storing the cached artifacts. The artifacts will be stored as `team/hash` in both cases.

### Local

When using the `local` storage options the artifacts will be saved in the location specified with the `LOCAL_STORAGE_PATH` environment variable. Note that the `node` user that is used by default only has access to the `/garden-snail` directory. Storage paths by default are relative to this directory.

You can then mount the specified storage path as a Docker volume to provide persistent storage for your deployment.

#### Example

```sh
docker run \
-e AUTH_TOKENS=change_this \
-e STORAGE_PROVIDER=local \
-e LOCAL_STORAGE_PATH=blobs \
-v "$(pwd)"/blobs:/garden-snail/blobs \
-p 3000:3000 \
pkarolyi/garden-snail
```

### S3

The `s3` storage driver supports AWS S3 and any S3 compatible storage that works with the `@aws-sdk/client-s3` client from the [JavaScript v3 AWS SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/introduction/). This includes for example [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces) or [MinIO](https://min.io/).

You will need to create the storage bucket and set up a user with the correct permissions. Garden Snail needs to be able to put and get objects and to use multipart uploads for storing large artifacts. The following is an example AWS Policy if using the bucket `garden-snail-test`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AccessBucketGardenSnailTest",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts",
        "s3:ListBucketMultipartUploads"
      ],
      "Resource": "arn:aws:s3:::garden-snail-test/*"
    }
  ]
}
```

Then you will need to specify the connection parameters for the [S3 client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/). The storage bucket (`S3_BUCKET`) is required. The credentials of the user (`S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`) are optional, but you will need to set them if you are not using an other method of providing access to the bucket.

If using a more advanced or custom setup you may need to set the following environment variables too:

- `S3_REGION` - This defaults to `us-east-1` if not set
- `S3_ENDPOINT` - If using a custom s3 provider you will need to set this
- `S3_FORCE_PATH_STYLE` - Some custom providers need this to be set to `"true"`
- `S3_SESSION_TOKEN` - If using a more advanced credentials setup you may need this
- If you need any other option feel free to open a PR or an issue!

The remote cache server does not remove old artifacts. If you need to limit the space used consider setting up [Object Expiration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-expire-general-considerations.html).

#### Example

```sh
docker run \
-e AUTH_TOKENS=change_this \
-e STORAGE_PROVIDER=s3 \
-e S3_BUCKET=your_bucket \
-e S3_ACCESS_KEY_ID=your_access_key_id \
-e S3_SECRET_ACCESS_KEY=your_secret_access_key \
-p 3000:3000 \
pkarolyi/garden-snail
```

## API Compatibility

Garden Snail implements the Turborepo v8 remote cache API. The following endpoints are fully supported:

| Endpoint | Method | Status |
|----------|--------|--------|
| `/v8/artifacts/status` | GET | Supported |
| `/v8/artifacts/:hash` | GET | Supported |
| `/v8/artifacts/:hash` | HEAD | Supported |
| `/v8/artifacts/:hash` | PUT | Supported |
| `/v8/artifacts/events` | POST | No-op (logs only) |
| `/v8/artifacts` | POST | Returns 501 |

The batch query endpoint (`POST /v8/artifacts`) is documented in Vercel's OpenAPI spec but **Turborepo does not actually use it**. The Rust implementation makes individual `HEAD` requests for cache existence checks instead of batch queries. Returning 501 does not affect compatibility with any tested Turborepo version.

## Notes

- Check the integration tests on the [workflow runs](https://github.com/pkarolyi/garden-snail/actions/) for a given tag to check for compatibility.
- The `1.1.0` release and releases prior to that **do not include any authorization or rate limiting functionality**.
- `1.2.0` is the first release with authentication. Rate limiting is not yet implemented.
