# Performance Optimization Principles

This document outlines the performance optimization principles and practices followed in this project, based on the [e18e ecosystem framework](https://github.com/e18e/e18e).

## The e18e Framework

e18e (pronounced "ease") is an ecosystem approach to JavaScript project optimization focusing on three core strategies:

1. **Cleanup** - Remove bloated, outdated, or redundant dependencies
2. **Speedup** - Optimize performance of critical components
3. **Levelup** - Replace heavy tools with modern, lightweight alternatives

**Resources:**
- [e18e GitHub Repository](https://github.com/e18e/e18e) - Core framework and principles
- [e18e Blog Post](https://www.epicweb.dev/the-webs-next-transition) - Kent C. Dodds on the web's transition
- [Modern Web Performance](https://web.dev/explore/fast) - Google's web performance guides

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

**Resources:**
- [TypeScript in Monorepos](https://turbo.build/repo/docs/handbook/linting/typescript) - Best practices for TypeScript in monorepos
- [pnpm Workspace Protocol](https://pnpm.io/workspaces#workspace-protocol-workspace) - Managing dependencies in pnpm workspaces

#### Knip Analysis

**Decision:** Run Knip regularly to identify unused dependencies.

**Why:**
- Unused dependencies increase bundle size
- They add security surface area (more code to audit)
- They slow down npm install operations
- They create maintenance burden during updates

**Current Status:** Clean - no unused dependencies detected.

**Resources:**
- [Knip Documentation](https://knip.dev/) - Find unused dependencies, exports, and types
- [Knip GitHub](https://github.com/webpro/knip) - Source code and issue tracker

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

**Resources:**
- [Rollup Documentation](https://rollupjs.org/) - Module bundler for JavaScript
- [@rollup/plugin-terser](https://github.com/rollup/plugins/tree/master/packages/terser) - Official Terser plugin for Rollup
- [Terser Documentation](https://terser.org/) - JavaScript minifier
- [Rollup Plugin Development](https://rollupjs.org/plugin-development/) - Creating and using Rollup plugins

#### Docker Build Optimization

**Decision:** Use `--prefer-offline` mode and explicit production builds in Docker.

**Why:**
- `--prefer-offline` uses cache when available, falls back to network for new dependencies
- Explicit `NODE_ENV=production` ensures terser minification runs
- Faster builds through better layer caching
- Balances performance with reliability for new dependencies

**Implementation:**
```dockerfile
# Before
RUN pnpm run build

# After
RUN pnpm install --prefer-offline --frozen-lockfile --filter='!@hello-world-web/*tests'
RUN NODE_ENV=production pnpm run build
```

**Rationale:**
- `--prefer-offline` provides best of both worlds: uses cache when possible, but doesn't fail on new deps
- `--offline` would fail when new dependencies are added after `pnpm fetch` (e.g., in development)
- `NODE_ENV=production` triggers minification in Rollup config
- Filtering out test packages reduces installation time

**Resources:**
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/) - Best practices for optimized Docker images
- [Docker Layer Caching](https://docs.docker.com/build/cache/) - Understanding Docker's build cache
- [pnpm in Docker](https://pnpm.io/docker) - Official guide for using pnpm in Docker
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md) - Official Node.js Docker guidance

### 3. Speedup - Runtime Performance

#### Compression Middleware

**Decision:** Add gzip compression for HTTP responses larger than 1KB.

**Why:**
- Reduces transfer size by 70-90% for text content (HTML, CSS, JS, JSON)
- Industry-standard compression supported by all modern browsers
- Minimal CPU overhead on modern servers
- Essential for production deployments
- Threshold prevents overhead on small responses

**Implementation:**
```typescript
// packages/app/src/app.ts
import compression from "compression";

const app: Express = express();
app.use(
  compression({
    threshold: 1024, // only compress responses larger than 1KB
  }),
);
```

**Rationale:**
- Applied before other middleware to compress all eligible responses
- 1KB threshold avoids compression overhead on small responses (headers, short JSON)
- Compression of responses <1KB often results in larger payloads due to gzip headers
- Express middleware has negligible performance impact
- Compression library is battle-tested and widely used

**Resources:**
- [compression npm package](https://www.npmjs.com/package/compression) - Official compression middleware for Node.js
- [HTTP Compression](https://developer.mozilla.org/en-US/docs/Web/HTTP/Compression) - MDN guide on HTTP compression
- [Express Performance Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html#use-gzip-compression) - Official Express.js performance guide

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

**Resources:**
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) - MDN comprehensive guide on HTTP caching
- [Cache-Control Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) - MDN Cache-Control directive reference
- [Caching Best Practices](https://web.dev/articles/http-cache) - Google's guide to HTTP cache best practices
- [express.static Options](https://expressjs.com/en/4x/api.html#express.static) - Express.js static file serving options
- [The immutable directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#immutable) - Understanding the immutable cache directive

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
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err: Error & { status?: number }, req, res, _next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(err.status || 500).json({
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
- `.json()` explicitly sets `Content-Type: application/json` header (better than `.send()`)
- Stack traces only in development (security)
- Proper HTTP status codes for monitoring/alerting
- TypeScript type augmentation avoids `any` type

**Resources:**
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html) - Official Express.js error handling guide
- [Node.js Error Handling Best Practices](https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick) - Understanding async error handling
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) - MDN reference for HTTP status codes

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

**Resources:**
- [RAIL Performance Model](https://web.dev/articles/rail) - User-centric performance model
- [Performance Budgets](https://web.dev/articles/performance-budgets-101) - Setting performance budgets
- [Measuring Performance](https://web.dev/articles/user-centric-performance-metrics) - User-centric performance metrics

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

**Resources:**
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html) - Official TypeScript best practices
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) - Comprehensive TypeScript guide
- [Type-safe Error Handling](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) - TypeScript type narrowing techniques

## Future Optimization Opportunities

### Medium Priority

These optimizations require more research or architectural changes:

#### Modern Build Tools
- **Vite** for development server (faster HMR than Rollup watch)
- **SWC** or **esbuild** for TypeScript compilation (10x faster)

**Consideration:** Migration effort vs. benefit, ecosystem maturity

**Resources:**
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [SWC](https://swc.rs/) - Rust-based JavaScript/TypeScript compiler
- [esbuild](https://esbuild.github.io/) - Extremely fast JavaScript bundler
- [Vite vs Rollup](https://vitejs.dev/guide/why.html#why-bundle-for-production) - Understanding when to use each

#### Runtime Alternatives
- **Fastify** or **Hono** instead of Express (2-3x faster)

**Consideration:** Express v5 is already fast enough for current scale, ecosystem compatibility

**Resources:**
- [Fastify](https://fastify.dev/) - Fast and low overhead web framework
- [Fastify Benchmarks](https://fastify.dev/benchmarks/) - Performance comparisons
- [Hono](https://hono.dev/) - Ultrafast web framework for the edge
- [Express.js v5](https://expressjs.com/en/guide/migrating-5.html) - Latest Express.js version

#### Script Simplification
- Reduce script complexity in package.json
- Consider task runner (turborepo, nx) for monorepo

**Consideration:** Current scripts work, added complexity might not be worth it

**Resources:**
- [Turborepo](https://turbo.build/repo) - High-performance build system for monorepos
- [Nx](https://nx.dev/) - Smart monorepos with powerful tooling
- [npm-run-all](https://github.com/mysticatea/npm-run-all) - CLI tool to run multiple npm-scripts in parallel or sequential

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

### Core Framework and Issue Tracking
- [e18e ecosystem framework](https://github.com/e18e/e18e) - The optimization framework this project follows
- [Issue #305 - Performance Optimization](https://github.com/eins78/hello-world-web/issues/305) - Original issue with detailed optimization categories

### Web Performance Resources
- [Web.dev Performance Guide](https://web.dev/performance/) - Google's comprehensive web performance documentation
- [Core Web Vitals](https://web.dev/articles/vitals) - Understanding essential metrics (LCP, FID, CLS)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) - Automated tool for improving web page quality
- [WebPageTest](https://www.webpagetest.org/) - Website performance and optimization testing

### Node.js and Express.js
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html) - Official Express.js performance guide
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Comprehensive Node.js best practices repository
- [Node.js Performance](https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production) - Official Node.js performance documentation

### Build Tools and Bundlers
- [Rollup vs Webpack vs Parcel](https://bundlers.tooling.report/) - Comprehensive bundler comparison
- [JavaScript Tooling Landscape](https://twitter.com/devongovett/status/1261379312898306048) - Understanding the modern JS tooling ecosystem

### Monorepo and TypeScript
- [Monorepo Tools](https://monorepo.tools/) - Comparison of monorepo tools and best practices
- [TypeScript Performance](https://github.com/microsoft/TypeScript/wiki/Performance) - Official TypeScript performance wiki

### HTTP and Caching
- [HTTP/2 vs HTTP/1.1](https://www.cloudflare.com/learning/performance/http2-vs-http1.1/) - Understanding HTTP protocol performance
- [Caching Tutorial](https://www.mnot.net/cache_docs/) - Mark Nottingham's caching tutorial (authoritative reference)

### Docker and Containers
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/) - Official Docker development best practices
- [Container Image Security](https://snyk.io/blog/10-docker-image-security-best-practices/) - Security considerations for container images

## Related Documentation

- [Development Guidelines](./development-guidelines.md) - Code quality standards
- [CI Troubleshooting](./ci-troubleshooting.md) - Build and test issues
- [Cloud Run Deployment](./cloud-run-deployment.md) - Production deployment
