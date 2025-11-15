# Contributing to SpeClarify

Thanks for taking the time to contribute! This guide explains how to propose changes, report issues, and keep the project healthy.

## Code of Conduct

Be respectful, empathetic, and considerate. Harassment or discrimination of any kind will not be tolerated. We will publish a formal Code of Conduct alongside the initial release.

## Getting Started

1. Fork the repository and clone your fork.
2. Create a feature branch: `git checkout -b feat/my-change`.
3. Install dependencies: `yarn install`.
4. Configure required environment variables (see [docs/setup-and-operations.md](docs/setup-and-operations.md)).

## Before You Commit

- Run `yarn lint` and fix reported issues.
- Add or update unit/integration tests. Confirm `yarn test` and `yarn test:e2e` both succeed.
- Update documentation if behavior, APIs, or operations change.
- When diagrams change, regenerate SVGs:
  ```bash
  plantuml -tsvg docs/diagrams/*.puml
  ```
  Commit both the `.puml` sources and resulting `.svg` outputs.

## Pull Requests

- Provide a clear description of what changed and why.
- Reference related issues or discussions.
- Highlight testing performed and include screenshots/logs when relevant.
- Keep PRs focused. Large changes should be broken into smaller, reviewable chunks.

## Reporting Bugs

When filing an issue:

- Describe the expected vs. actual behavior.
- Include reproduction steps, logs, and environment details (OS, Node version, Mongo/Redis versions).
- Mention whether the bug involves background events, LLM integrations, or storage systems.

## Feature Requests

- Explain the problem the feature solves.
- Propose an implementation approach if possible.
- Indicate whether the change affects API contracts, database schemas, or external integrations.

## Security

Please report security vulnerabilities privately. Reach out to the maintainers directly so we can coordinate a fix before disclosure.

## Release Checklist (Maintainers)

- Ensure migrations (if any) have been applied.
- Verify integrations with MongoDB, Redis, MinIO, and OpenAI in the target environment.
- Confirm Swagger docs reflect current routes.
- Tag the release and publish notes summarizing changes.

We appreciate your contributions and feedback. Thank you for helping SpeClarify grow!
