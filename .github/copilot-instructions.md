**Core Stack**
- NestJS 10 app with MongoDB via Mongoose; see src/app.module.ts for module wiring and providers.
- main.ts sets global prefix `/api/v1`, enables Swagger at `/api/docs`, and installs a 422-returning ValidationPipe—new controllers must align.
- ConfigurationModule is global; use EnvironmentConfig/MailerConfig/SecurityConfig instead of `process.env` in services.

**Module Patterns**
- Each domain lives under src/modules/<name> with module/service/repository/controller/schema files; register models with `MongooseModule.forFeature`.
- Controllers return ApiResponse and paginate with PageResponse (e.g., src/modules/project/project.controller.ts); follow that format for new endpoints.
- Repositories often return Optional wrappers or raw documents; mimic UserService for user lookups if optional semantics fit.

**Async Pipelines**
- Document ingestion flow: DocumentService → emit `DocumentParseRequest.<mime>` → parser service → emit `ParseRequirementsRequest` → RequirementsParserService → emit `BulkCreateRequirementRequest` → RequirementService → emit `IdentifyAmbiguityRequest` handled by AmbiguityService; reuse these exact event names.
- ChainsModule centralizes LangChain sequences using LLM.getInstance() (ChatOpenAI gpt-3.5-turbo-1106); extend here for new LLM workflows.
- ConcurrencyLimit.getInstance() throttles LLM-heavy loops; wrap new asynchronous batch jobs with it to avoid rate limits.
- RequirementClassifyChain builds few-shot prompts using OpenAIEmbeddings + HNSWLib; supply diverse examples when invoking.

**Security & Roles**
- AuthenticationModule registers global JwtAuthGuard, UserRolesGuard, OrganizationRolesGuard; expose public routes with @Public and secure others with @UserRoles/@OrganizationRoles.
- JwtAuthGuard resolves full user documents and organization memberships onto request; access them via @CurrentUser and `request.membership`.
- DispatchGateway uses JWT secrets and Redis-backed socket tracking; emit websocket actions via DispatchService.dispatchAction.

**Data & Files**
- FileService stores assets in MinIO; FileType drives folder structure. Delete existing objects before uploading replacements (see ProjectService.update).
- Use FileService.getSignedUrl when returning file paths; do not expose raw MinIO object names to clients.
- RedisService bootstrap pulls REDIS_* env vars and stores keys like `user:<id>:socketId`; always clean up on disconnect.
- EmailService listens to `email.send`; emit ISendMailOptions events instead of calling MailerService directly.

**Domain Notes**
- RequirementService.create auto-derives priority, classifies type, saves, then emits ambiguity detection—retain this sequence for manual inserts.
- Projects are scoped by organization path; slugify names as in ProjectService (`trim().toLowerCase().replace(/\s/g, '-')`).
- Paginated queries expect `search/pageNumber/pageSize`; repositories often apply regex filters—honor those inputs.

**API Conventions**
- All HTTP routes resolve under `/api/v1`; update Swagger metadata when shipping new modules.
- Controllers should wrap successes with ApiResponse.success() and throw Nest HTTP exceptions for failures.
- DTOs rely on class-validator/class-transformer; ValidationPipe does not whitelist, so validate explicitly.

**Environment**
- Required env vars: Mongo (MONGO_URI/MONGO_USER/MONGO_PASSWORD/MONGO_DB_NAME), JWT (JWT_SECRET/JWT_EXPIRES_IN), Redis (REDIS_HOST/REDIS_PORT/REDIS_PASSWORD/REDIS_DB), Mailer (MAILER_*), MinIO (MINIO_*), OpenAI key, SERVER_PORT, CORS_ORIGIN.
- EnvironmentConfig replaces escaped newlines; store multiline secrets with `\n`.

**Testing Workflow**
- Definition of done: add unit/integration specs for each change and run the full suite (`yarn test`, `yarn test:e2e`); fix failures before completion.
- Favor colocated `*.spec.ts` files or extend existing suites in the touched module; update the placeholder test/app.e2e-spec.ts when routes evolve.
- Use `yarn start:dev` for watch mode and `yarn build`/`yarn start:prod` for release validation.

**Gotchas**
- Event names are string literals—typos silently drop work; consider extracting constants when extending flows.
- Services expect Mongo ObjectIds (`Types.ObjectId.createFromHexString(...)`); convert incoming strings before repository calls.
- PageResponse assumes `pageSize > 0`; validate query DTOs to avoid divide-by-zero state.
- LangChain model/version is fixed; coordinate upgrades with ambiguity/classification prompt expectations.
