import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

const { Given, Then } = createBdd();

Given("I navigate to the homepage", async ({ page }) => {
  await page.goto("/");
});

Given("I navigate to the Lit SSR demo page", async ({ page }) => {
  await page.goto("/lit-ssr-demo");
});

Then("I should see {string} as the page title", async ({ page }, title: string) => {
  const heading = page.locator("h1");
  await expect(heading).toContainText(title);
});
