# SpeClarify Backend

SpeClarify is a requirements-engineering assistant that ingests project documents, extracts candidate requirements, classifies and prioritizes them, and highlights ambiguity using LLM-backed pipelines. This repository hosts the NestJS backend that powers those workflows.

- **Stack:** NestJS 10, MongoDB (Mongoose), Redis, MinIO, LangChain + OpenAI, Socket.IO
- **Focus:** Automating requirement extraction, triage, and collaboration inside organizations

## Getting Started

### Prerequisites
- Node.js 20+ and Yarn
- MongoDB instance
- Redis instance
- MinIO (or S3-compatible) object storage
- OpenAI API key (supports `gpt-3.5-turbo-1106`)

### Installation
```bash
yarn install
```

### Environment
Copy `.env.example` or set the variables documented in [docs/setup-and-operations.md](docs/setup-and-operations.md#environment-reference). Provide credentials for MongoDB, Redis, MinIO, mailing, JWT secrets, and OpenAI.

### Run Locally
```bash
# development
yarn start

# watch mode
yarn start:dev

# production build
yarn build
yarn start:prod
```

### Run With Docker Compose
```bash
cp .env.example .env
docker compose up --build
```

This boots the API plus MongoDB, Redis, and MinIO. The API listens on `http://localhost:${SERVER_PORT:-3000}`, MongoDB exposes `localhost:27017`, Redis `localhost:6379`, and the MinIO console is available at `http://localhost:9090` (default login `minioadmin/minioadmin`).

### Tests
```bash
# unit tests
yarn test

# e2e tests
yarn test:e2e

# coverage report
yarn test:cov
```

## Documentation
- [Architecture](docs/architecture.md)
- [Setup & Operations](docs/setup-and-operations.md)
- [Development Guide](docs/development-guide.md)
- [Contributing](CONTRIBUTING.md)

PlantUML diagrams that illustrate data flow and security boundaries live under `docs/diagrams/`. See [Development Guide](docs/development-guide.md#diagram-workflow) for regeneration instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
