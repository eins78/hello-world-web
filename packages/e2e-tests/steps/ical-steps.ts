import { expect, type Download } from "@playwright/test";
import { createBdd, DataTable } from "playwright-bdd";
import { ICalDemoPage } from "../pages/ical-demo-page.ts";
import { getTestData } from "../utils/test-data.ts";

const { Given, When, Then } = createBdd();

interface DemoTestData {
  download: Download;
}

Given("I am on the iCalendar demo page", async ({ page }) => {
  await new ICalDemoPage(page).navigate();
});

When("I fill in the event form with:", async ({ page }, dataTable: DataTable) => {
  const demoPage = new ICalDemoPage(page);
  for (const row of dataTable.hashes()) {
    if (row.field && row.value) {
      await demoPage.fillField(row.field, row.value);
    }
  }
});

When("I click {string}", async ({ page }, buttonText: string) => {
  await new ICalDemoPage(page).clickButton(buttonText);
});

When("I clear the {string} field", async ({ page }, fieldName: string) => {
  await new ICalDemoPage(page).clearField(fieldName);
});

When("I select {string} from the timezone dropdown", async ({ page }, timezone: string) => {
  await new ICalDemoPage(page).selectTimezone(timezone);
});

When("I set the cancelAt date to yesterday", async ({ page }) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  await new ICalDemoPage(page).setCancelAt(yesterday);
});

When("I click the {string} button", async ({ page }, buttonText: string) => {
  await new ICalDemoPage(page).clickButton(buttonText);
});

When("I click the download link", async ({ page }) => {
  // Register the download listener before clicking, so the event is not missed
  const downloadPromise = page.waitForEvent("download");
  await new ICalDemoPage(page).clickDownloadLink();
  getTestData<DemoTestData>(page).download = await downloadPromise;
});

Then("I should see a feed URL", async ({ page }) => {
  const feedUrl = await new ICalDemoPage(page).getFeedUrl();
  // absolute URL, API path directly under the origin (no double slash)
  expect(feedUrl).toMatch(/^https?:\/\/[^/]+\/api\/ical\/events\.ics\?/);
});

Then("I should see a download link", async ({ page }) => {
  const downloadLink = await new ICalDemoPage(page).getDownloadLink();
  expect(downloadLink).toBeTruthy();
});

Then("I should see a subscribe link", async ({ page }) => {
  const subscribeLink = await new ICalDemoPage(page).getSubscribeLink();
  expect(subscribeLink).toBeTruthy();
});

Then("the form should not submit", async ({ page }) => {
  // The result section stays hidden
  await expect(page.locator("#result")).toBeHidden();
});

Then("I should see a validation error", async ({ page }) => {
  // HTML5 validation will show browser-specific error
  const titleField = page.locator("#title");
  const validationMessage = await titleField.evaluate((el: HTMLInputElement) => el.validationMessage);
  expect(validationMessage).toBeTruthy();
});

Then("the feed URL should contain {string}", async ({ page }, expectedContent: string) => {
  const feedUrl = await new ICalDemoPage(page).getFeedUrl();
  expect(feedUrl).toContain(expectedContent);
});

Then("the button should show {string}", async ({ page }, expectedText: string) => {
  const copyButton = page.locator("#copy-btn");
  await expect(copyButton).toHaveText(expectedText);
});

Then(
  "the button should revert to {string} after {int} seconds",
  async ({ page }, originalText: string, seconds: number) => {
    const copyButton = page.locator("#copy-btn");
    await expect(copyButton).toHaveText(originalText, { timeout: seconds * 1000 + 1000 });
  },
);

Then("an .ics file should be downloaded", async ({ page }) => {
  const { download } = getTestData<DemoTestData>(page);
  expect(download, "download was triggered").toBeTruthy();
  expect(download!.suggestedFilename()).toBe("events.ics");
});

Then("the subscribe link should use {string} protocol", async ({ page }, protocol: string) => {
  const subscribeLink = await new ICalDemoPage(page).getSubscribeLink();
  expect(subscribeLink).toMatch(new RegExp(`^${protocol}`));
});
