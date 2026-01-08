# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Garden Snail is a self-hosted Remote Cache server for Turborepo written in NestJS. It serves as a drop-in replacement for Vercel's remote cache and supports storing artifacts locally or in S3-compatible storage.

## Commands

```bash
# Install dependencies (pnpm required)
pnpm install

# Development
pnpm start:dev          # Watch mode with hot reload
pnpm start:debug        # Debug mode with Node inspector

# Build
pnpm build              # Compile with SWC to dist/

# Testing
pnpm test               # Run unit tests once
pnpm test:watch         # Run unit tests in watch mode
pnpm test:cov           # Run tests with coverage
pnpm test:e2e           # Run E2E tests

# Run a single test file
pnpm test src/config/configuration.spec.ts

# Linting & Formatting
pnpm lint               # ESLint with auto-fix
pnpm format             # Prettier formatting
```

## Architecture

```
HTTP Request → Fastify → NestJS Route Handler
     ↓
ArtifactsGuard (Bearer token validation against AUTH_TOKENS env var)
     ↓
ArtifactsController (v8 API: GET/HEAD/PUT/POST /v8/artifacts/*)
     ↓
StorageService (abstraction layer)
     ↓
StorageDriver (LocalStorageDriver | S3StorageDriver)
```

### Module Structure

- **AppModule** - Root module with ConfigModule (Zod validation)
- **ArtifactsModule** - HTTP endpoints for artifact operations
- **StorageModule** - Pluggable storage backends (local FS or S3)

### Key Files

- `src/config/configuration.ts` - Zod-based environment validation schema
- `src/artifacts/artifacts.guard.ts` - Bearer token authentication
- `src/storage/storage.service.ts` - Storage abstraction layer
- `src/storage/providers/*.driver.ts` - Storage implementations

## Testing

Test files use `.spec.ts` suffix. Unit tests mock services via `Test.createTestingModule()` and `vi.spyOn()`. E2E tests use `app.inject()` for HTTP requests.

Test env vars are auto-set in vitest config: `AUTH_TOKENS=token`, `STORAGE_PROVIDER=local`, `LOCAL_STORAGE_PATH=blobs`

### Integration Tests

Integration tests verify actual Turborepo compatibility via Docker Compose:

- **v1**: Tests turbo `1.13.4`
- **v2**: Tests turbo `^2` (latest 2.x)

Run locally with:
```bash
docker compose -f integration/compose-v1.yml build
docker compose -f integration/compose-v1.yml run test-v1 1.13.4

docker compose -f integration/compose-v2.yml build
docker compose -f integration/compose-v2.yml run test-v2 ^2
```

The integration test script (`integration/v*/integration.run.sh`) validates that:
1. First build uploads artifacts to the cache
2. After clearing local cache, second build retrieves from remote cache
3. Output contains "Remote caching enabled", "cache hit, replaying logs", and "FULL TURBO"

## CI/CD Pipeline

Reusable workflows in `.github/workflows/`:
- **build.yml** - Compiles TypeScript
- **test.yml** - Runs lint, unit tests, e2e tests, then integration tests with matrix strategy
- **deploy.yml** - Builds and pushes multi-arch Docker image (amd64/arm64) to Docker Hub

Triggers:
- Pull requests: build → test (no deploy)
- Push to main: build → test → deploy with `edge` tag
- Push tag `v*`: build → test → deploy with semver tag

## Configuration

Environment variables validated via Zod schema in `src/config/configuration.ts`:
- `AUTH_TOKENS` - Comma-separated bearer tokens
- `STORAGE_PROVIDER` - `local` or `s3`
- Local: `LOCAL_STORAGE_PATH`
- S3: `S3_BUCKET`, `S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, optional `S3_ENDPOINT`
