import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

const { Given, Then } = createBdd();

Given("I am on the homepage", async ({ page }) => {
  await page.goto("/");
});

Given("I am on the Lit SSR demo page", async ({ page }) => {
  await page.goto("/lit-ssr-demo");
});

Then("the page title should be {string}", async ({ page }, title: string) => {
  await expect(page).toHaveTitle(title);
});
