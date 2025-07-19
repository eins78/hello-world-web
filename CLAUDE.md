# Hello World Web - Project Context

## Project Overview

This is a minimal Express.js web server designed as a **demo and testing platform** for web features. The project serves as a sandbox for implementing and testing various web technologies before integrating them into production applications.

## Project Purpose

The primary purpose of this repository is to:

1. **Prototype new features** in a simple, isolated environment
2. **Test client compatibility** across different platforms and browsers
3. **Document vendor-specific workarounds** and implementation quirks
4. **Provide working demos** that can be easily shared and tested

## Project Scope

This is intentionally a **bare minimum** implementation that focuses on:

- Simple, educational code that is still production-ready and secure
- Quick prototyping of features without complex dependencies
- Easy-to-understand examples that demonstrate core concepts
- Comprehensive testing capabilities (E2E, unit tests)

## Key Design Principles

1. **Minimal but Complete**: Features should be simple but fully functional
2. **RFC Compliance**: Follow official specifications while documenting real-world workarounds
3. **Client Compatibility**: Test and document behavior across major clients/browsers
4. **Educational Value**: Code should be clear and well-commented

## Architecture

- **Express.js** server with TypeScript support
- **Lit SSR** for server-side rendering demos
- **Cypress** for E2E testing
- **Node.js built-in test runner** for unit tests
- Modular route structure under `/src/routes`

## Features

For implemented features and demos, see:
- Main README: [/README.md](/README.md)
- Feature documentation: `/docs/features/`
- Live demos: Available from the homepage when running the server

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test  # Unit tests
pnpm e2e   # E2E tests
```

## Adding New Features

When adding new demo features:

1. Create feature documentation in `/docs/features/`
2. Implement types in `/src/types/`
3. Add routes under `/src/routes/`
4. Create demo page if applicable
5. Add comprehensive tests (E2E and unit)
6. Link from homepage

## Recent Additions

- **iCalendar Demo**: Dynamic calendar feed generation with client compatibility testing. See [/docs/features/ical.md](/docs/features/ical.md)

## Notes

This project uses Node.js experimental features for TypeScript support (`--experimental-strip-types`). Ensure you're using Node.js 22.7.0 or higher.