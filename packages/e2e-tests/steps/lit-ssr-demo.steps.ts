import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

const { Given, When, Then } = createBdd();

let currentEpochValue: number;

// Simple Counter Steps
Then("the simple counter should display count {string}", async ({ page }, count: string) => {
  const countElement = await page.locator("simple-counter").locator("#count");
  await expect(countElement).toHaveText(count);
});

Then(
  "the simple counter element should have attribute {string} with value {string}",
  async ({ page }, attribute: string, value: string) => {
    const element = page.locator("simple-counter");
    await expect(element).toHaveAttribute(attribute, value);
  },
);

Given("the simple counter displays count {string}", async ({ page }, count: string) => {
  const countElement = await page.locator("simple-counter").locator("#count");
  await expect(countElement).toHaveText(count);
});

When("I wait for the simple counter to be hydrated", async ({ page }) => {
  // Wait for the button to be enabled (indicates hydration is complete)
  const button = await page.locator("simple-counter").locator("button:not([disabled])");
  await expect(button).toBeEnabled();
});

When("I click the simple counter increment button", async ({ page }) => {
  const button = await page.locator("simple-counter").locator("button");
  await button.click();
});

// Epoch Counter Steps
Then("the epoch counter should display a timestamp greater than {string}", async ({ page }, minValue: string) => {
  const timeElement = await page.locator("epoch-counter").locator("time");
  const text = await timeElement.textContent();
  const value = parseInt(text!, 10);
  expect(value).toBeGreaterThan(parseInt(minValue, 10));
});

Then("the epoch counter element should not have attribute {string}", async ({ page }, attribute: string) => {
  const element = page.locator("epoch-counter");
  await expect(element).not.toHaveAttribute(attribute);
});

Given("I note the current epoch counter value", async ({ page }) => {
  const timeElement = await page.locator("epoch-counter").locator("time");
  const text = await timeElement.textContent();
  currentEpochValue = parseInt(text!, 10);
});

When("I wait for the epoch counter to be hydrated", async ({ page }) => {
  // Wait for the button to be enabled (indicates hydration is complete)
  const button = await page.locator("epoch-counter").locator("button:not([disabled])");
  await expect(button).toBeEnabled();
});

When("I click the epoch counter increment button", async ({ page }) => {
  const button = await page.locator("epoch-counter").locator("button");
  await button.click();
});

Then("the epoch counter should display an incremented value", async ({ page }) => {
  const timeElement = await page.locator("epoch-counter").locator("time");
  const text = await timeElement.textContent();
  const newValue = parseInt(text!, 10);
  expect(newValue).toBe(currentEpochValue + 1);
});
