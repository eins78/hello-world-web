# E2E Tests with Playwright-BDD

This package contains end-to-end tests using Playwright with BDD (Behavior-Driven Development) approach.

## Stack

- **[Playwright](https://playwright.dev/)** - Modern web testing framework
- **[playwright-bdd](https://github.com/vitalets/playwright-bdd)** - BDD layer for Playwright
- **[Gherkin](https://cucumber.io/docs/gherkin/)** - Business-readable test specifications

## Structure

```
e2e-tests/
├── features/          # Gherkin feature files
├── steps/            # Step definitions
├── pages/            # Page Object Model
├── GHERKIN_RULES.md  # Gherkin writing guidelines
└── playwright.config.ts
```

## Writing Tests

### 1. Follow Gherkin Best Practices

Before writing new tests, review our [Gherkin style guide](./GHERKIN_RULES.md) which outlines:
- Proper Given-When-Then structure
- Business language over technical language
- Scenario naming conventions
- Common anti-patterns to avoid

### 2. Create Feature Files

Write test scenarios in Gherkin syntax in the `features/` directory:

```gherkin
Feature: User authentication
  As a user
  I want to log into the application
  So that I can access my personal dashboard

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be redirected to my dashboard
```

### 3. Implement Step Definitions

Create corresponding step definitions in the `steps/` directory:

```typescript
import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

const { Given, When, Then } = createBdd();

Given("I am on the login page", async ({ page }) => {
  await page.goto("/login");
});
```

## Running Tests

```bash
# Generate test files from features
pnpm run generate

# Run all tests
pnpm test

# Run tests in UI mode
pnpm run test:ui

# Run specific feature
pnpm test features/homepage.feature
```

## CI Integration

Tests run automatically on pull requests. The CI workflow:
1. Installs Chromium browser only (for faster CI runs)
2. Generates BDD test files
3. Runs tests with 2 retries on failure
4. Produces HTML reports

## Development Tips

1. **Keep scenarios focused**: Each scenario should test one behavior
2. **Use backgrounds wisely**: Only for truly common setup across all scenarios
3. **Maintain step reusability**: Write generic steps that can be reused
4. **Follow Page Object pattern**: Keep page interactions in page objects

## Troubleshooting

### Missing Browser Dependencies
If you see browser launch errors, install system dependencies:
```bash
# Ubuntu/Debian
sudo npx playwright install-deps

# Or manually:
sudo apt-get install libnspr4 libnss3 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0
```

### Node.js Version
The application requires Node.js 22.7.0+ for TypeScript support. For tests with Node 20.x, we use `tsx` as a workaround.

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [playwright-bdd Documentation](https://github.com/vitalets/playwright-bdd)
- [Cucumber Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Our Gherkin Style Guide](./GHERKIN_RULES.md)