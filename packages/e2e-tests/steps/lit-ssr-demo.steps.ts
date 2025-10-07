import { createBdd } from "playwright-bdd";
import { expect, Page } from "@playwright/test";

const { Given, When, Then } = createBdd();

// Store test-specific data in page context to avoid shared state
interface TestData {
  currentEpochValue?: number;
}

function getTestData(page: Page & { testData?: TestData }): TestData {
  if (!page.testData) {
    page.testData = {};
  }
  return page.testData;
}

// Simple Counter Steps
Then("the simple counter should show {string}", async ({ page }, count: string) => {
  const countElement = page.locator("simple-counter").locator("#count");
  await expect(countElement).toHaveText(count);
});

Then(
  "the simple counter should have a {string} attribute set to {string}",
  async ({ page }, attribute: string, value: string) => {
    const element = page.locator("simple-counter");
    await expect(element).toHaveAttribute(attribute, value);
  },
);

Given("the simple counter shows {string}", async ({ page }, count: string) => {
  const countElement = page.locator("simple-counter").locator("#count");
  await expect(countElement).toHaveText(count);
});

When("the component finishes hydrating", async ({ page }) => {
  // Wait for buttons to be enabled (indicates hydration is complete)
  const simpleButton = page.locator("simple-counter").locator("button:not([disabled])");
  const epochButton = page.locator("epoch-counter").locator("button:not([disabled])");

  // Check which component we're dealing with based on visibility
  if (await simpleButton.isVisible()) {
    await expect(simpleButton).toBeEnabled();
  } else if (await epochButton.isVisible()) {
    await expect(epochButton).toBeEnabled();
  }
});

When("I click the increment button on the simple counter", async ({ page }) => {
  const button = page.locator("simple-counter").locator("button");
  await button.click();
});

// Epoch Counter Steps
Then("the epoch counter should show a timestamp greater than {string}", async ({ page }, minValue: string) => {
  const timeElement = page.locator("epoch-counter").locator("time");
  const text = await timeElement.textContent();
  const value = parseInt(text!, 10);
  expect(value).toBeGreaterThan(parseInt(minValue, 10));
});

Then("the epoch counter should not have an {string} attribute", async ({ page }, attribute: string) => {
  const element = page.locator("epoch-counter");
  await expect(element).not.toHaveAttribute(attribute);
});

Given("I note the current epoch counter value", async ({ page }) => {
  const timeElement = page.locator("epoch-counter").locator("time");
  const text = await timeElement.textContent();
  const testData = getTestData(page);
  testData.currentEpochValue = parseInt(text!, 10);
});

When("I click the increment button on the epoch counter", async ({ page }) => {
  const button = page.locator("epoch-counter").locator("button");
  await button.click();
});

Then("the epoch counter value should increase by one", async ({ page }) => {
  const timeElement = page.locator("epoch-counter").locator("time");
  const text = await timeElement.textContent();
  const newValue = parseInt(text!, 10);
  const testData = getTestData(page);
  expect(newValue).toBe((testData.currentEpochValue || 0) + 1);
});
