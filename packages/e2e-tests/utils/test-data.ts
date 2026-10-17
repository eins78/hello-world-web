import type { Page } from "@playwright/test";

/**
 * Per-scenario storage attached to the Playwright page.
 * Step definitions must not keep module-level state, because scenarios run in parallel
 * (see docs/development-guidelines.md "Avoiding Shared State in Tests").
 */
export function getTestData<T extends object>(page: Page): Partial<T> {
  const holder = page as Page & { testData?: Partial<T> };
  if (!holder.testData) {
    holder.testData = {};
  }
  return holder.testData;
}
