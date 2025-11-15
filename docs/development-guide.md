# Development Guide

This guide documents day-to-day workflows, coding patterns, and expectations for contributors.

## Project Scripts

```bash
yarn lint          # ESLint with auto-fix
yarn test          # unit tests
yarn test:e2e      # end-to-end tests
yarn test:cov      # coverage report
yarn start:dev     # watch mode
yarn build         # compile to dist/
yarn start:prod    # run compiled bundle
```

Definition of done: every change should include matching unit/integration tests and pass both `yarn test` and `yarn test:e2e` before submission.

## Coding Conventions

- **Modules:** Place new features under `src/modules/<domain>` with aligned controller/service/repository/schema/DTO files. Register schemas via `MongooseModule.forFeature`.
- **Responses:** Wrap HTTP responses with `ApiResponse.success()`/`ApiResponse.error()`. Paginate using `PageResponse` and honor `search/pageNumber/pageSize` query params.
- **DTOs:** Use `class-validator` and `class-transformer`. The global `ValidationPipe` does not whitelist properties; explicitly validate/transform fields.
- **Repositories:** Return Mongoose documents or `Optional<T>` where nullability matters. Avoid returning raw queries.
- **Guards:** Mark routes with `@Public`, `@UserRoles`, and/or `@OrganizationRoles`. Access user data with `@CurrentUser()`.
- **ObjectIds:** Convert incoming strings via `Types.ObjectId.createFromHexString(...)` before repository calls.
- **Files:** Always use `FileService` for uploads/deletions/presigned URLs. Delete existing objects before replacing them.
- **Events:** Event names are literal strings (e.g., `DocumentParseRequest.text/plain`). Typos drop work silently—consider centralizing constants when expanding flows.

## LangChain & LLM Usage

- Reuse `LLM.getInstance()` for chains registered in `ChainsModule` to avoid redundant client allocations.
- Use `ConcurrencyLimit.getInstance()` around any loop that invokes an LLM to respect rate limits.
- Supply diverse historical examples when calling `RequirementClassifyChain.execute` so the HNSW-backed retrieval works well.
- Keep prompts declarative; include positive/negative examples where possible.

## Testing Patterns

- Prefer colocated `*.spec.ts` files alongside implementation.
- Mock external services (MinIO, Redis, Mailer) using Nest testing utilities or lightweight stubs.
- Update `test/app.e2e-spec.ts` when new public routes are added.
- For asynchronous flows, unit test the event handler and repository interactions separately.

## Commit & PR Expectations

1. Lint and format (`yarn lint`).
2. Run unit and e2e tests.
3. Include documentation updates when modifying behavior or surface area.
4. Reference related issues or discussions in PR descriptions.

## Diagram Workflow

PlantUML source files live under `docs/diagrams/`. When updating a `.puml`:

```bash
plantuml -tsvg docs/diagrams/*.puml
```

Commit both the `.puml` and regenerated `.svg`. Contributors who do not have PlantUML locally can install it via Homebrew (`brew install plantuml`) or run the official Docker image.

## Useful Tips

- Swagger is mounted at `/api/docs`; keep decorators up to date on controllers and DTOs.
- `setupGracefulShutdown` in `main.ts` ensures graceful termination. If adding long-running processes, hook into the shutdown lifecycle.
- `RedisService` logs failures; monitor output when debugging websocket dispatch issues.
- Use `FileService.uploadBuffer` for generated assets (e.g., XLSX exports). Always return presigned URLs instead of raw MinIO keys.

For architecture context, see [Architecture](architecture.md). Setup instructions live in [Setup & Operations](setup-and-operations.md).
