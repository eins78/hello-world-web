import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";
import type { APIResponse, Page } from "@playwright/test";

const { When, Then } = createBdd();

// Store the last response on the page object to avoid shared state between tests
type PageWithResponse = Page & { lastResponse?: APIResponse };

function lastResponse(page: PageWithResponse): APIResponse {
  expect(page.lastResponse, "a request step must run first").toBeDefined();
  return page.lastResponse!;
}

When("I ask the API for {string}", async ({ page }, path: string) => {
  (page as PageWithResponse).lastResponse = await page.request.get(path, {
    headers: { Accept: "application/json" },
  });
});

When("I ask for the page {string}", async ({ page }, path: string) => {
  (page as PageWithResponse).lastResponse = await page.request.get(path, {
    headers: { Accept: "text/html" },
  });
});

Then("the answer should be {string}", async ({ page }, statusText: string) => {
  const statusCodes: Record<string, number> = { "Not Found": 404 };
  expect(lastResponse(page).status()).toBe(statusCodes[statusText]);
});

Then("the answer should be JSON with the error {string}", async ({ page }, error: string) => {
  const response = lastResponse(page);
  expect(response.headers()["content-type"]).toContain("application/json");
  expect(await response.json()).toMatchObject({ error });
});

Then("the answer should be a web page", async ({ page }) => {
  expect(lastResponse(page).headers()["content-type"]).toContain("text/html");
});
