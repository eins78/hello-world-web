import { expect } from "@playwright/test";
import { createBdd, DataTable } from "playwright-bdd";
import { ICalDemoPage } from "../pages/ical-demo-page.ts";

const { Given, When, Then } = createBdd();
let iCalDemoPage: ICalDemoPage;

Given("I am on the iCalendar demo page", async ({ page }) => {
  iCalDemoPage = new ICalDemoPage(page);
  await iCalDemoPage.navigate();
});

When("I fill in the event form with:", async (_page, dataTable: DataTable) => {
  const data = dataTable.hashes();
  for (const row of data) {
    if (row.field && row.value) {
      await iCalDemoPage.fillField(row.field, row.value);
    }
  }
});

When("I click {string}", async (_page, buttonText: string) => {
  await iCalDemoPage.clickButton(buttonText);
});

When("I clear the {string} field", async (_page, fieldName: string) => {
  await iCalDemoPage.clearField(fieldName);
});

When("I select {string} from the timezone dropdown", async (_page, timezone: string) => {
  await iCalDemoPage.selectTimezone(timezone);
});

When("I set the cancelAt date to yesterday", async (_page) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  await iCalDemoPage.setCancelAt(yesterday);
});

When("I click the {string} button", async (_page, buttonText: string) => {
  await iCalDemoPage.clickButton(buttonText);
});

When("I click the download link", async (_page) => {
  await iCalDemoPage.clickDownloadLink();
});

Then("I should see a feed URL", async (_page) => {
  const feedUrl = await iCalDemoPage.getFeedUrl();
  expect(feedUrl).toBeTruthy();
  expect(feedUrl).toContain("/api/ical/events.ics");
});

Then("I should see a download link", async (_page) => {
  const downloadLink = await iCalDemoPage.getDownloadLink();
  expect(downloadLink).toBeTruthy();
});

Then("I should see a subscribe link", async (_page) => {
  const subscribeLink = await iCalDemoPage.getSubscribeLink();
  expect(subscribeLink).toBeTruthy();
});

Then("the form should not submit", async (_page) => {
  // The result section should remain hidden
  const isResultVisible = await iCalDemoPage.isResultVisible();
  expect(isResultVisible).toBe(false);
});

Then("I should see a validation error", async ({ page }) => {
  // HTML5 validation will show browser-specific error
  const titleField = page.locator("#title");
  const validationMessage = await titleField.evaluate((el: HTMLInputElement) => el.validationMessage);
  expect(validationMessage).toBeTruthy();
});

Then("the feed URL should contain {string}", async (_page, expectedContent: string) => {
  const feedUrl = await iCalDemoPage.getFeedUrl();
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
    await page.waitForTimeout(seconds * 1000 + 100); // Add small buffer
    await expect(copyButton).toHaveText(originalText);
  },
);

Then("an .ics file should be downloaded", async ({ page }) => {
  // Set up download promise before clicking
  const downloadPromise = page.waitForEvent("download");
  await iCalDemoPage.clickDownloadLink();
  const download = await downloadPromise;

  // Verify file extension
  expect(download.suggestedFilename()).toBe("events.ics");
});

Then("the subscribe link should use {string} protocol", async (_page, protocol: string) => {
  const subscribeLink = await iCalDemoPage.getSubscribeLink();
  expect(subscribeLink).toMatch(new RegExp(`^${protocol}`));
});
