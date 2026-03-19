# AGENTS.md

## Project Overview

APSAS Backend is a Java 21 Spring Boot/Spring Cloud microservices monorepo built with Gradle Kotlin DSL.

- Build system: Gradle wrapper with included `build-logic` convention plugins
- Architecture: service registry + config server + API gateway + domain services + shared libraries
- Runtime dependencies (dev): PostgreSQL, RabbitMQ, Redis, Mailpit
- Configuration model: centralized config files under `config/` consumed by Config Server

Top-level modules:

- Infrastructure apps:
    - `:sources:service-registry`
    - `:sources:config-server`
    - `:sources:gateway`
- Business services:
    - `:sources:services:identity`
    - `:sources:services:content`
    - `:sources:services:submission`
    - `:sources:services:evaluation`
    - `:sources:services:notification`
    - `:sources:services:support`
- Shared libraries:
    - `:sources:shared:security`
    - `:sources:shared:messaging`
    - `:sources:shared:exception`
    - `:sources:shared:models`
    - `:sources:shared:feign-clients`
    - `:sources:shared:cache`
    - `:sources:shared:api-docs`
- Admin portal app:
    - `:sources:admin-portal`

## Setup Commands

Use Gradle wrapper from repository root.

- Windows PowerShell/CMD: `gradlew.bat <task>`
- Bash: `./gradlew <task>`

Recommended first-run commands:

```bash
./gradlew --version
./gradlew projects --console=plain
```

Start dev infrastructure:

```bash
docker compose -f docker-compose.dev.yaml up -d
```

Stop dev infrastructure:

```bash
docker compose -f docker-compose.dev.yaml down
```

## Development Workflow

Run everything from repository root unless there is a specific reason not to.

Build and verify quickly:

```bash
./gradlew build -x test --console=plain
```

Run all checks/tests:

```bash
./gradlew test --console=plain
./gradlew check --console=plain
```

Run one app/service with Spring Boot:

```bash
./gradlew :sources:services:identity:bootRun
./gradlew :sources:gateway:bootRun
./gradlew :sources:config-server:bootRun
./gradlew :sources:service-registry:bootRun
```

The convention plugin sets `spring.profiles.active=dev,local` for `bootRun`.

Build one module only:

```bash
./gradlew :sources:services:content:build
./gradlew :sources:shared:models:build
```

Inspect tasks for any module:

```bash
./gradlew :sources:services:identity:tasks --all --console=plain
```

## Source Layout Conventions

This repo does not use the default Maven-style source directories.

- Main Java sources: `src/`
- Main resources: `resources/`
- Test Java sources: `test/`
- Test resources: `testResources/`

When adding tests, create the `test/` and `testResources/` directories in the target module if they do not exist.

## Testing Instructions

Current baseline:

- `./gradlew test` succeeds in the repo

Agent expectations for code changes:

- Add or update tests in affected module(s) whenever behavior changes
- At minimum, run:

```bash
./gradlew :<changed-module>:test --console=plain
```

- Before finalizing cross-module work, run:

```bash
./gradlew test --console=plain
```

Examples:

```bash
./gradlew :sources:services:submission:test --console=plain
./gradlew :sources:shared:security:test --console=plain
```

## Code Style and Patterns

- Language level: Java 21 (toolchain is configured in conventions)
- Keep package names and module naming consistent with existing structure (`apsas.<service>` style under each module)
- Prefer constructor injection and Spring idioms already used by neighboring code
- Reuse shared modules (`sources/shared/*`) instead of duplicating DTOs, exceptions, or security/messaging helpers
- Keep edits minimal and scoped; avoid unrelated refactors

There is no repository-wide formatter/linter task configured in Gradle conventions at this time. Use existing file style
and imports in the touched module.

## Build and Deployment

Create executable jars for all modules:

```bash
./gradlew build -x test --console=plain
```

Build container image for one Spring Boot module:

```bash
./gradlew :sources:services:identity:bootBuildImage
```

`bootBuildImage` uses image naming pattern:

- `${DOCKER_HUB_USERNAME:-library}/apsas-${project.name}`

Production stack orchestration:

```bash
docker compose -f docker-compose.prod.yaml up -d
```

## Configuration and Security Notes

- Treat secrets as environment variables (JWT keys, DB credentials, mail credentials, Firebase credentials)
- Do not commit real credentials to repository files
- Config Server reads centralized config under `config/`
- For local API testing, HTTP client environment lives in `http-clients/http-client.env.json` (default `BASE_URL` is
  `http://localhost:8080`)

## Monorepo Navigation Tips

- List all projects:

```bash
./gradlew projects --console=plain
```

- Build only what you changed to iterate quickly, then run full `test` before handing off
- If modifying shared libraries, expect dependent services to require rebuild/retest

## Pull Request Guidelines

Before opening or updating a PR:

```bash
./gradlew build -x test --console=plain
./gradlew test --console=plain
```

PR checklist for agents:

- Keep changes module-focused and atomic
- Include tests when behavior changes
- Mention impacted modules in PR description
- Include any required config/environment changes

## Troubleshooting

- `bootRun` failures at startup often mean required infra services are not running; start `docker-compose.dev.yaml`
  first
- If dependency resolution or task graph is stale, run:

```bash
./gradlew clean
```

- If running on Windows, use `gradlew.bat` when `./gradlew` is unavailable
