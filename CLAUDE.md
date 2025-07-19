# Hello World Web - Project Memory

This file contains project-specific instructions for Claude Code. It is automatically loaded when Claude Code launches in this project directory.

## Quick Reference

### Frequently Used Commands
```bash
pnpm dev          # Run development server
pnpm test         # Run unit tests
pnpm e2e          # Run E2E tests
pnpm lint         # Run type checking
```

### Import Other Memory Files
@./AGENTS.md      # General AI agent guidelines

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


## Implemented Features

- **iCalendar Demo**: Dynamic calendar feed generation with client compatibility testing. See [/docs/features/ical.md](/docs/features/ical.md)
- **Lit SSR Demo**: Server-side rendering examples (coming soon)

For all features, see:
- Main README: [/README.md](/README.md)
- Feature documentation: `/docs/features/`
- Live demos: Available from the homepage when running the server



## Project-Specific Configuration

### Technical Requirements
- **Node.js**: 22.7.0 or higher (for `--experimental-strip-types`)
- **Package Manager**: pnpm (exclusively)
- **TypeScript**: Use experimental Node.js support, no build step
- **Testing**: Node.js test runner for unit tests, Cypress for E2E

### Environment Variables
- `PORT`: Server port (default: 3000)
- `DEBUG`: Debug namespace (use `hello-world-web:*`)
- `NODE_ENV`: Environment (development/production)

## Current Focus & Open Tasks

### Active Development
- Building minimal demos for web standards testing
- Documenting client compatibility issues
- Creating educational examples that are production-ready

### Known Issues
- None currently tracked

### Technical Debt
- Consider migrating from experimental TypeScript support when stable