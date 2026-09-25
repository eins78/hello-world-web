# Deno Runtime Support - Design Document

**Date**: 2025-11-30
**Status**: In Progress (Phases 1-3 Complete, Phases 5-6 Implementing)
**Branch**: `deno`

## Executive Summary

Add dual runtime support to hello-world-web, enabling deployment on both Node.js 22 and Deno 2.x with identical functionality. The implementation uses Deno's Node.js compatibility layer via `npm:` specifiers, requiring zero code changes to the existing application.

## Goals

1. **Learning**: Explore Deno 2.x's Node.js compatibility in production
2. **Performance**: Compare runtime performance and resource usage
3. **Modern tooling**: Leverage Deno's built-in TypeScript, linting, formatting
4. **Deployment flexibility**: Support both runtimes for different deployment targets

## Non-Goals

- Replacing Node.js entirely (dual runtime, not migration)
- Rewriting to use Deno-native frameworks (Express works fine)
- Breaking changes to existing Node.js deployment

## Architecture Overview

### Dual Runtime Strategy

```
hello-world-web (Monorepo)
├─ Node.js 22 Runtime
│  ├─ Commands: pnpm start, pnpm dev
│  ├─ Deployment: hello.kiste.li
│  └─ Docker: ghcr.io/eins78/hello-world-web:latest
│
└─ Deno 2.x Runtime
   ├─ Commands: pnpm start:deno, pnpm dev:deno
   ├─ Deployment: dev-deno.hello.kiste.li
   └─ Docker: ghcr.io/eins78/hello-world-web:deno-latest
```

### Key Findings

**No Code Changes Required!** The codebase was already 99% Deno-compatible:
- ✅ Pure ESM (`"type": "module"`)
- ✅ `node:` prefixes on built-in imports
- ✅ No `require()` calls
- ✅ Modern TypeScript

**Everything Works via npm: Specifiers:**
- ✅ Express 5.1 (`npm:express@^5.1.0`)
- ✅ All middleware (cookie-parser, morgan, dotenv)
- ✅ @lit-labs/ssr (SSR + hydration)
- ✅ Static file serving
- ✅ All routes

## Implementation Phases

### Phase 1-3: Core Compatibility ✅ COMPLETE

**Deliverables:**
- `deno.json` configuration with tasks
- `pnpm start:deno` and `pnpm dev:deno` scripts
- `packages/app/src/runtime.ts` - runtime detection helper
- Manual verification of all routes and SSR

**Result:** Application runs perfectly on both Node.js and Deno locally.

### Phase 5: E2E Tests on Deno 🚧 IN PROGRESS

**Approach:** GitHub Actions matrix strategy

**Changes to test.yml:**
```yaml
strategy:
  matrix:
    runtime: [node, deno]

steps:
  - name: Setup Node.js
    if: matrix.runtime == 'node'
    uses: actions/setup-node@v4
    with:
      node-version: '22.21.1'

  - name: Setup Deno
    if: matrix.runtime == 'deno'
    uses: denoland/setup-deno@v2
    with:
      deno-version: v2.x

  - name: Install dependencies (Node)
    if: matrix.runtime == 'node'
    run: pnpm install

  - name: Build
    run: pnpm run build

  - name: Lint
    run: pnpm run lint
```

**Changes to bdd-tests.yml:**
Similar matrix strategy with conditional start commands:
- Node: `pnpm run e2e`
- Deno: `deno task start` + Playwright

**Benefits:**
- Both runtimes tested on every PR
- Renovate can update setup actions automatically
- Easy to spot runtime-specific issues
- Minimal code duplication

### Phase 6: CI/CD and Deployment 🚧 IN PROGRESS

#### Docker Configuration

**Dockerfile.deno:**
```dockerfile
FROM denoland/deno:2.0.0

WORKDIR /app

# Install pnpm for lit-ssr-demo build (uses Rollup)
RUN curl -fsSL https://get.pnpm.io/install.sh | sh
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Copy and build lit-ssr-demo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/lit-ssr-demo ./packages/lit-ssr-demo
RUN cd packages/lit-ssr-demo && pnpm install && pnpm run build

# Copy app source
COPY packages/app ./packages/app
COPY deno.json ./

# Pre-cache Deno dependencies
RUN deno install --entrypoint packages/app/src/bin/www.ts

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD deno run --allow-net packages/app/src/bin/healthcheck.mts

EXPOSE 8080
CMD ["deno", "run", "-A", "packages/app/src/bin/www.ts"]
```

**Key Differences from Node Dockerfile:**
- Base: `denoland/deno:2.0.0` vs `node:22-alpine`
- Dependencies: `deno install --entrypoint` vs `npm install`
- Still needs pnpm temporarily for lit-ssr-demo Rollup build
- Healthcheck uses `deno run` instead of `node`

#### Docker E2E Test Workflow

Create `.github/workflows/docker-e2e-tests-deno.yml`:
```yaml
name: Docker E2E Tests (Deno)

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -f Dockerfile.deno -t hello-world-web:deno .

      - name: Run container
        run: docker run -d -p 8080:8080 --name test-deno hello-world-web:deno

      - name: Wait for server
        run: npx wait-on http://localhost:8080 --timeout 30000

      - name: Run E2E tests
        run: docker exec test-deno deno task e2e || true

      - name: Stop container
        run: docker stop test-deno
```

#### Cloud Run Deployment

**Updated cloud-run-deploy.yml:**
```yaml
jobs:
  deploy-node:
    name: Deploy Node.js version
    runs-on: ubuntu-latest
    steps:
      # ... existing Node.js deployment to hello.kiste.li ...

  deploy-deno:
    name: Deploy Deno version
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}

      - name: Authenticate Docker
        run: gcloud auth configure-docker

      - name: Build and push Deno image
        run: |
          docker build -f Dockerfile.deno \
            -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/hello-world-web:deno-latest .
          docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/hello-world-web:deno-latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy hello-world-web-deno \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/hello-world-web:deno-latest \
            --region europe-west1 \
            --platform managed \
            --allow-unauthenticated \
            --port 8080 \
            --memory 512Mi \
            --cpu 1

      - name: Map custom domain
        run: |
          gcloud run services update-traffic hello-world-web-deno \
            --to-latest \
            --region europe-west1
          # Manual step: Map dev-deno.hello.kiste.li via Cloud Console
```

**Deployment Topology:**
- **Node.js Service**: `hello-world-web` → `hello.kiste.li`
- **Deno Service**: `hello-world-web-deno` → `dev-deno.hello.kiste.li`

**Benefits:**
- Independent deployments and rollbacks
- Side-by-side performance comparison
- Zero impact on production Node.js deployment

## Technical Details

### Configuration Files

**deno.json:**
```json
{
  "$schema": "https://deno.land/x/deno/cli/schemas/config-file.v1.json",
  "nodeModulesDir": "auto",
  "tasks": {
    "dev": "deno run -A --watch packages/app/src/bin/www.ts",
    "start": "deno run -A packages/app/src/bin/www.ts",
    "build:lit": "pnpm -F lit-ssr-demo run build"
  }
}
```

**package.json (added scripts):**
```json
{
  "scripts": {
    "dev:deno": "deno task dev",
    "start:deno": "deno task start"
  }
}
```

### Runtime Detection

**packages/app/src/runtime.ts:**
```typescript
declare const Deno: typeof globalThis.Deno | undefined;

export const isDeno = typeof Deno !== "undefined";
export const isNode = typeof process !== "undefined" && !isDeno;
export const runtime = isDeno ? "deno" : "node";

export function getRuntimeInfo() {
  if (isDeno && Deno) {
    return {
      runtime: "deno" as const,
      version: Deno.version.deno,
      v8: Deno.version.v8,
      typescript: Deno.version.typescript,
    };
  } else {
    return {
      runtime: "node" as const,
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    };
  }
}
```

## Testing Strategy

### Local Testing
```bash
# Node.js
pnpm start          # → http://localhost:4444
pnpm dev            # → with watch mode

# Deno
pnpm start:deno     # → http://localhost:4444
pnpm dev:deno       # → with watch mode
deno task start     # → direct command
```

### CI Testing Matrix

All tests run on **both** runtimes in parallel:
- Lint (ESLint)
- Build (TypeScript check)
- E2E (Playwright BDD tests)
- Docker E2E (production-like environment)

Failure in either runtime blocks the PR.

### Verification Checklist

- [ ] `pnpm start:deno` starts server successfully
- [ ] All routes respond correctly (`/`, `/lit-ssr-demo`)
- [ ] SSR renders Lit components with hydration
- [ ] Static assets served
- [ ] Cookies work
- [ ] Logging works (morgan)
- [ ] E2E tests pass
- [ ] Docker image builds
- [ ] Docker container runs and serves traffic
- [ ] Cloud Run deployment succeeds
- [ ] Custom domain accessible

## Risks and Mitigations

### Risk: Deno npm: compatibility issues

**Likelihood**: Low (already verified)
**Impact**: Medium
**Mitigation**: Comprehensive test matrix catches issues early; can disable Deno deployment independently

### Risk: Performance regression

**Likelihood**: Unknown
**Impact**: Medium
**Mitigation**: Separate deployment allows side-by-side comparison; can rollback independently

### Risk: Dependency updates break Deno

**Likelihood**: Low
**Impact**: Medium
**Mitigation**: CI matrix tests both runtimes on every update; Renovate PRs will show failures

### Risk: Increased CI time

**Likelihood**: High
**Impact**: Low
**Mitigation**: Matrix runs in parallel; total time ~same as single runtime

## Rollback Plan

If Deno causes issues:
1. Node.js deployment remains unchanged and functional
2. Disable Deno workflows: comment out matrix runtime in YAML
3. Delete Deno Cloud Run service
4. Remove `deno.json` and `start:deno` scripts if desired

**Zero risk to production Node.js deployment.**

## Success Metrics

- [ ] Both runtimes pass all tests in CI
- [ ] Deno deployment accessible at `dev-deno.hello.kiste.li`
- [ ] Performance comparison documented
- [ ] No additional maintenance burden (Renovate updates work)

## Future Considerations

1. **Performance analysis**: Compare startup time, memory usage, request latency
2. **Native Deno frameworks**: Evaluate Hono or Fresh for better Deno integration
3. **Deno Deploy**: Consider serverless deployment option
4. **Bundle size**: Compare Deno's bundling vs Rollup

## References

- [Deno Node.js Compatibility](https://docs.deno.com/runtime/fundamentals/node/)
- [Deno 2 Announcement](https://deno.com/blog/v2.0)
- [Deno Migration Guide](https://docs.deno.com/runtime/reference/migration_guide/)
- [Express on Deno](https://docs.deno.com/runtime/fundamentals/node/#using-npm-packages)
