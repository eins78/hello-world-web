import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const { Then } = createBdd();

const ONE_YEAR_IMMUTABLE = "public, max-age=31536000, immutable";

async function expectKeptForAYear(page: Page, selector: string) {
  const link = page.locator(selector);
  await expect(link).toHaveAttribute("href", /.+/);
  const href = (await link.getAttribute("href"))!;
  const response = await page.request.get(new URL(href, page.url()).href);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe(ONE_YEAR_IMMUTABLE);
}

Then("the stylesheet should be kept for a year", async ({ page }) => {
  await expectKeptForAYear(page, 'link[rel="stylesheet"]');
});

Then("the demo script should be kept for a year", async ({ page }) => {
  await expectKeptForAYear(page, "link#client-entry");
});
