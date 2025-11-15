# Setup and Operations

This guide walks through installing runtime dependencies, configuring environment variables, and running the SpeClarify backend in different modes.

## Prerequisites

- **Runtime:** Node.js 20+, Yarn, Docker (optional)
- **Services:**
  - MongoDB (SRV or standalone)
  - Redis (used for websocket session tracking and caching)
  - MinIO or S3-compatible object storage
  - SMTP server for outbound email (MailerModule)
  - OpenAI API key for LangChain integrations
- **Tooling:** PlantUML (optional, used to regenerate diagrams)

## Environment Reference

Configuration is surfaced through the global `EnvironmentConfig` service. Set the following variables before starting the app:

```env
# Server
NODE_ENV=development
SERVER_PORT=3000
CORS_ORIGIN=http://localhost:5000

# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_USER=
MONGO_PASSWORD=
MONGO_DB_NAME=speclarify

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=change-me
JWT_EXPIRES_IN=1d

# Mailer
MAILER_HOST=smtp.example.com
MAILER_PORT=587
MAILER_SECURE=false
MAILER_REQUIRE_TLS=true
MAILER_USER=api@example.com
MAILER_PASS=
MAILER_FROM="SpeClarify <no-reply@example.com>"

# MinIO / S3-compatible storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET_NAME=speclarify
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# OpenAI
OPENAI_API_KEY=
```

> ℹ️ `EnvironmentConfig` automatically converts escaped newlines (`\n`) back into newline characters. This is useful for multiline secrets.

## Service Provisioning

### MongoDB
- Development: run `mongod --dbpath <path>` locally or use Docker (`docker run -p 27017:27017 mongo:7`).
- Ensure the user pointed to by `MONGO_USER` has read/write access to `MONGO_DB_NAME`.

### Redis
- Start via Docker: `docker run -p 6379:6379 redis:7`.
- Password-protect Redis in production and set `REDIS_PASSWORD`/`REDIS_DB` accordingly.

### MinIO
- Launch locally: `docker run -p 9000:9000 -p 9090:9090 -e MINIO_ROOT_USER=... -e MINIO_ROOT_PASSWORD=... minio/minio server /data --console-address :9090`.
- Create the bucket named in `MINIO_BUCKET_NAME` and configure lifecycle policies as needed.

### SMTP
- Use a transactional provider (SendGrid, SES, etc.). Verify credentials and allowlist the `MAILER_FROM` address.

### OpenAI
- Create an API key at https://platform.openai.com/. Grant it access to `gpt-3.5-turbo-1106`.

## Local Development

```bash
yarn install
yarn start:dev
```

`start:dev` enables watch mode. Swagger UI is available at `http://localhost:3000/api/docs`.

When working on document ingestion, ensure MinIO, OpenAI, and Redis services are reachable; otherwise background events will fail silently.

## Production Build

```bash
yarn build
yarn start:prod
```

The build output lives in `dist/`. Place your `.env` or exported environment variables on the host and ensure external services are reachable over the network.

## Docker Tips

The provided `Dockerfile` produces a production image. Example workflow:

```bash
docker build -t speclarify-be .
docker run --env-file .env -p 3000:3000 speclarify-be
```

Review the Dockerfile if you prefer `yarn` over `npm` during container builds.

## Docker Compose

Use the bundled `docker-compose.yml` for a batteries-included setup (MongoDB, Redis, MinIO, and the API):

```bash
docker compose up --build
```

The compose file reads from `.env` and overrides hostnames so containers can reach each other (`mongo`, `redis`, `minio`). Update `MONGO_URI`, `REDIS_HOST`, and `MINIO_ENDPOINT` to the service names above if you are reusing the same file outside Docker Compose.

Volumes are mounted for MongoDB, Redis, and MinIO to persist data between runs. MinIO defaults to `minioadmin:minioadmin`; change `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` in `.env` for production.

- API: `http://localhost:${SERVER_PORT:-3000}` with Swagger at `/api/docs`
- MongoDB: `mongodb://localhost:27017`
- Redis: `redis://localhost:6379`
- MinIO S3 endpoint: `http://localhost:9000`; console at `http://localhost:9090`

On first boot, log in to the MinIO console and create the bucket specified by `MINIO_BUCKET_NAME` (default `speclarify`).

## Testing

```bash
yarn lint      # ESLint with auto-fix
yarn test      # unit tests
yarn test:e2e  # end-to-end tests
yarn test:cov  # coverage report
```

Follow the definition of done: add or update tests for every change and ensure both `yarn test` and `yarn test:e2e` succeed before committing.

## Observability and Operations

- **Graceful shutdown:** `nestjs-graceful-shutdown` ensures open connections close cleanly. Customize via `setupGracefulShutdown` in `main.ts` if deploying to environments with strict termination policies.
- **Logging:** NestJS default logger is used. Consider central log aggregation for production deployments.
- **Redis keys:** Websocket sessions use the pattern `user:<id>:socketId`. Ensure Redis eviction policies do not remove active sessions.

## Disaster Recovery

- Back up MongoDB regularly.
- Mirror MinIO buckets or configure replication.
- Store infrastructure credentials securely (Vault, AWS Secrets Manager, etc.).
- Monitor OpenAI usage to avoid hitting rate limits; adjust `ConcurrencyLimit` if necessary.
