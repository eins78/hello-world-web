# hello-world-web

## 2.0.0-rc.3

### Major Changes

- Migrate to pnpm workspace monorepo (app, e2e-tests, lit-ssr-demo packages)
- Migrate E2E tests from Cypress to Playwright with BDD (playwright-bdd)
- Add native TypeScript execution in Node.js (no tsx/ts-node)
- Add Google Artifact Registry and Cloud Run deployment automation
- Add Claude Code automation workflows (PR review, Renovate review, interactive)

### Features

- Add dependency diff analysis workflow
- Add GitHub Deployments integration for development environment
- Add Docker Hub link and CI metadata to deployment footer
- Collapse outdated comments on synchronized PRs
- Add three-workflow architecture for Claude Code automation
- Add CI-aware PR reviews (wait for all checks before reviewing)
- Implement multi-stage Docker build for production images
- Add Docker end-to-end tests workflow
- Add custom domain mapping to Cloud Run deployment
- Add shellcheck integration for bash linting

### Bug Fixes

- Fix Docker E2E port mapping and test configuration
- Fix corepack in CI and Docker images
- Fix lit-ssr-demo client path resolution for static server
- Fix Cloud Run deployment stability with proper image propagation
- Build only AMD64 for PRs to avoid ARM64 QEMU failures
- Use browser-specific cache keys to avoid Playwright conflicts

### Refactoring

- Streamline CLAUDE.md and documentation structure
- Remove VERSION.env references, modernize version handling
- Optimize AI instruction compliance and discoverability
- Remove deprecated dependencies and unused code (knip)

### Dependencies

- Update Express to v5
- Update Node.js to v22 LTS
- Update pnpm to v10
- Numerous Renovate-managed dependency updates

## 1.3.0

### Features

- Add npx support for running the server directly
- Add lit-ssr-demo: interactive Lit SSR components with hydration (DataTable, simple-counter)
- Serve lit-ssr-demo from backend with proper index files
- Add Cypress E2E testing with GitHub Actions CI
- Add multi-arch Docker image builds
- Refactor dark mode to use CSS variables with link colors

### Changes

- Migrate all server JavaScript files to TypeScript
- Build source from TypeScript, run dev mode from source
- Update Node.js to v22
- Run TypeScript from source in Node.js natively
- Add rollup build pipeline for TypeScript
- Update home view to display HTTP client info by default

## 1.2.1-rc.1

### Features

- Port views to Lit SSR server-only templates (Html, Home, SectionApi components)
- Add `@lit-labs/ssr` for server-side rendering support
- Add `dev:trace-sync-io` script for debugging

## 1.2.0

### Features

- Migrate from CommonJS to ES modules
- Migrate from npm to pnpm with corepack
- Add ESLint with recommended rules
- Add systemd deployment target (Node.js and Docker)
- Add favicon with customizable colors
- Add BASE_PATH support for web server
- Docker layer caching in GitHub Actions

### Bug Fixes

- Fix .env-default file
- Fix Docker image build (corepack, pnpm install)
- Fix typos in package.json version field and README

### Changes

- Update Node.js to v20
- Typecheck `@ts-check` enabled JS files in test script
- Run tests on pull requests in CI

## 1.1.0

### Features

- Add client info API (`/api/client/:field`)
- RESTful content negotiation for text/html/json
- Display client info on homepage
- Add basic type checking with `@ts-check`

### Dependencies

- Bump qs and express (security update)

## 1.0.0

### Features

- Initial release: Express.js web server with API endpoints
- API endpoints: `/api/time`, `/api/config`
- Dark mode CSS support
- Docker and Docker Compose support
- GitHub Actions CI/CD for Docker image publishing
- Health check endpoint
- Configurable APP_TITLE via environment variable
- Version display via dotenv
