import { createBdd, DataTable } from "playwright-bdd";
import { expect } from "@playwright/test";
import { isValidSemverWithNonZeroMajor, isValidISODate } from "../utils/validation";

const { When, Then } = createBdd();

Then("the server configuration section should be collapsed", async ({ page }) => {
  const details = page.locator('details:has(summary:has-text("server config"))');
  await expect(details).not.toHaveAttribute("open");
});

Then("the server configuration section should be expanded", async ({ page }) => {
  const details = page.locator('details:has(summary:has-text("server config"))');
  await expect(details).toHaveAttribute("open", "");
});

When("I click on the server configuration toggle", async ({ page }) => {
  const summary = page.locator('summary:has-text("server config")');
  await summary.click();
});

When("I expand the server configuration section", async ({ page }) => {
  const summary = page.locator('summary:has-text("server config")');
  await summary.click();
});

Then(
  "I should see configuration data containing:",
  async ({ page }, dataTable: DataTable) => {
    const pre = page.locator('details:has(summary:has-text("server config")) pre');
    await expect(pre).toBeVisible();

    const jsonText = await pre.textContent();
    const json = JSON.parse(jsonText!);

    const expectedProperties = dataTable.hashes();

    for (const row of expectedProperties) {
      const { property } = row;

      switch (property) {
        case "basePath":
          expect(json).toHaveProperty("basePath", "/");
          break;

        case "startupTime": {
          expect(json).toHaveProperty("startupTime");
          expect(isValidISODate(json.startupTime)).toBe(true);
          break;
        }

        case "version": {
          expect(json).toHaveProperty("version");
          expect(isValidSemverWithNonZeroMajor(json.version)).toBe(true);
          break;
        }
      }
    }
  },
);
