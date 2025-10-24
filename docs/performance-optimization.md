# Performance Optimization Principles

This document outlines the performance optimization principles and practices followed in this project, based on the [e18e ecosystem framework](https://github.com/e18e/e18e).

## The e18e Framework

e18e (pronounced "ease") is an ecosystem approach to JavaScript project optimization focusing on three core strategies:

1. **Cleanup** - Remove bloated, outdated, or redundant dependencies
2. **Speedup** - Optimize performance of critical components
3. **Levelup** - Replace heavy tools with modern, lightweight alternatives

## Applied Optimizations

### 1. Cleanup - Dependency Management

#### TypeScript Version Alignment

**Decision:** Align TypeScript versions across all workspace packages.

**Why:**
- Eliminates version conflicts in monorepo builds
- Ensures consistent type-checking behavior
- Reduces duplicate installations in node_modules
- Simplifies troubleshooting

**Implementation:**
```json
// Before: packages/lit-ssr-demo/package.json
"typescript": "^5.5.4"

// After: aligned with workspace root
"typescript": "^5.7.2"
```

**Rationale:**
- Root workspace and packages/app already used 5.7.2
- Caret (^) ranges can cause drift over time
- Explicit alignment prevents subtle bugs from type definition differences

#### Knip Analysis

**Decision:** Run Knip regularly to identify unused dependencies.

**Why:**
- Unused dependencies increase bundle size
- They add security surface area (more code to audit)
- They slow down npm install operations
- They create maintenance burden during updates

**Current Status:** Clean - no unused dependencies detected.

### 2. Speedup - Build Performance

#### Rollup Minification

**Decision:** Add terser minification to Rollup builds in production mode only.

**Why:**
- Reduces client-side JavaScript bundle size by 40-60%
- Improves page load times and bandwidth usage
- Production-only to maintain fast dev builds
- Server-side bundles also benefit from reduced size

**Implementation:**
```javascript
// packages/lit-ssr-demo/rollup.config.js
import terser from "@rollup/plugin-terser";

const isProduction = process.env.NODE_ENV === "production";

plugins: [
  typescript({ tsconfig: "./tsconfig.client.json" }),
  isProduction && terser(),
].filter(Boolean)
```

**Rationale:**
- Terser is industry-standard, actively maintained
- Source maps remain enabled for debugging
- Boolean filter pattern is idiomatic Rollup configuration
- Environment variable check allows dev/prod split

#### Docker Build Optimization

**Decision:** Use offline mode and explicit production builds in Docker.

**Why:**
- `--offline` leverages pnpm's fetch cache more effectively
- Explicit `NODE_ENV=production` ensures terser minification runs
- Faster builds through better layer caching
- Prevents network flakiness during build

**Implementation:**
```dockerfile
# Before
RUN pnpm install --prefer-offline --frozen-lockfile
RUN pnpm run build

# After
RUN pnpm install --offline --frozen-lockfile
RUN NODE_ENV=production pnpm run build
```

**Rationale:**
- `pnpm fetch` already cached all packages in prior layer
- `--offline` guarantees no network calls = faster + deterministic
- Production builds create optimized artifacts for deployment

### 3. Speedup - Runtime Performance

#### Compression Middleware

**Decision:** Add gzip compression for all HTTP responses.

**Why:**
- Reduces transfer size by 70-90% for text content (HTML, CSS, JS, JSON)
- Industry-standard compression supported by all modern browsers
- Minimal CPU overhead on modern servers
- Essential for production deployments

**Implementation:**
```typescript
// packages/app/src/app.ts
import compression from "compression";

const app: Express = express();
app.use(compression());
```

**Rationale:**
- Applied before other middleware to compress all responses
- Default configuration suitable for most cases
- Express middleware has negligible performance impact
- Compression library is battle-tested and widely used

#### Cache-Control Headers

**Decision:** Add aggressive caching for static assets in production (1 year + immutable).

**Why:**
- Static assets (CSS, JS, images) rarely change at the same URL
- 1-year cache eliminates redundant downloads for returning users
- `immutable` directive tells browsers never to revalidate
- Dramatically improves page load times for repeat visitors

**Implementation:**
```typescript
express.static(publicPath, {
  maxAge: process.env.NODE_ENV === "production" ? "1y" : "0",
  immutable: process.env.NODE_ENV === "production",
})
```

**Rationale:**
- Development uses no caching (maxAge: "0") for immediate updates
- Production assumes content-addressed or versioned URLs
- Follows industry best practices (e.g., Webpack, Vite default behavior)
- No manual cache busting needed with proper build pipeline

#### Production Error Handling

**Decision:** Implement comprehensive error handling middleware.

**Why:**
- Prevents server crashes from unhandled errors
- Provides appropriate error messages per environment
- Hides internal details from production users (security)
- Enables proper logging and monitoring integration

**Implementation:**
```typescript
// 404 handler
app.use((req, res) => {
  res.status(404).send({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err: Error & { status?: number }, req, res, _next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(err.status || 500).send({
    error: process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});
```

**Rationale:**
- 404 handler placed after all routes
- Global error handler catches async errors
- Stack traces only in development (security)
- Proper HTTP status codes for monitoring/alerting
- TypeScript type augmentation avoids `any` type

## Principles and Best Practices

### Environment-Aware Optimization

**Principle:** Different optimizations for development vs. production.

**Guidelines:**
- **Development:** Prioritize fast rebuilds and clear error messages
- **Production:** Prioritize small bundles, caching, and security

**Examples:**
- Minification: Production only
- Cache headers: Production = 1 year, Development = 0
- Error messages: Production = generic, Development = detailed
- Source maps: Both (but production maps can be uploaded separately)

### Progressive Enhancement

**Principle:** Add optimizations incrementally with measurable impact.

**Guidelines:**
1. Measure baseline performance
2. Implement one optimization at a time
3. Verify improvement with metrics
4. Document decisions and rationale

**Metrics to Track:**
- Bundle sizes (JS, CSS)
- Build time (local, CI)
- Page load times (LCP, FCP)
- Docker image size
- Time to Interactive (TTI)

### Zero-Config Defaults

**Principle:** Optimizations should work automatically without configuration.

**Guidelines:**
- Use `NODE_ENV` to determine behavior
- Provide sensible defaults
- Allow overrides via environment variables when needed
- Document non-standard configuration

**Examples:**
- Terser runs automatically when `NODE_ENV=production`
- Cache headers set based on `NODE_ENV`
- Compression uses default settings (no config needed)

### TypeScript-First

**Principle:** Maintain type safety in all optimization code.

**Guidelines:**
- Never use `any` type - use proper type definitions
- Prefix unused parameters with underscore (e.g., `_next`)
- Add type packages for runtime dependencies (e.g., `@types/compression`)
- Extend built-in types rather than casting

**Example:**
```typescript
// BAD
app.use((err: any, req, res, next) => { ... })

// GOOD
app.use((err: Error & { status?: number }, req, res, _next) => { ... })
```

## Future Optimization Opportunities

### Medium Priority

These optimizations require more research or architectural changes:

#### Modern Build Tools
- **Vite** for development server (faster HMR than Rollup watch)
- **SWC** or **esbuild** for TypeScript compilation (10x faster)

**Consideration:** Migration effort vs. benefit, ecosystem maturity

#### Runtime Alternatives
- **Fastify** or **Hono** instead of Express (2-3x faster)

**Consideration:** Express v5 is already fast enough for current scale, ecosystem compatibility

#### Script Simplification
- Reduce script complexity in package.json
- Consider task runner (turborepo, nx) for monorepo

**Consideration:** Current scripts work, added complexity might not be worth it

### Low Priority

These are premature optimizations for current scale:

- Cluster mode / worker threads (single-threaded is fine)
- CDN integration (no high traffic yet)
- Advanced caching strategies (Redis, etc.)
- Image optimization pipeline

## Measuring Success

### Before Optimizations (Baseline)

- **Build time:** ~4s (Rollup builds)
- **Bundle sizes:** Unminified (~300KB client bundle estimated)
- **Docker build:** 2-3 minutes
- **Response sizes:** No compression

### After Optimizations (Expected)

- **Build time:** ~4s dev, ~6s production (minification overhead)
- **Bundle sizes:** Minified (~120KB client bundle estimated, 60% reduction)
- **Docker build:** 2-3 minutes (offline mode, better caching)
- **Response sizes:** 70-90% reduction via gzip
- **Cache hit rate:** 95%+ for static assets on repeat visits

### Verification Commands

```bash
# Check bundle sizes
pnpm run build
du -sh packages/lit-ssr-demo/lib/client/*.js

# Test compression locally
NODE_ENV=production pnpm start
curl -H "Accept-Encoding: gzip" -I http://localhost:9999/

# Verify cache headers
curl -I http://localhost:9999/favicon.ico

# Docker build time
time docker build -t hello-world-web .
```

## References

- [e18e ecosystem framework](https://github.com/e18e/e18e)
- [Issue #305 - Performance Optimization](https://github.com/eins78/hello-world-web/issues/305)
- [Web.dev Performance Guide](https://web.dev/performance/)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

## Related Documentation

- [Development Guidelines](./development-guidelines.md) - Code quality standards
- [CI Troubleshooting](./ci-troubleshooting.md) - Build and test issues
- [Cloud Run Deployment](./cloud-run-deployment.md) - Production deployment
