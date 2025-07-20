import type { Page, Locator } from "@playwright/test";

export class ICalDemoPage {
  readonly page: Page;
  readonly form: Locator;
  readonly result: Locator;
  readonly feedUrl: Locator;
  readonly downloadLink: Locator;
  readonly subscribeLink: Locator;
  readonly copyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator("#ical-form");
    this.result = page.locator("#result");
    this.feedUrl = page.locator("#feed-url");
    this.downloadLink = page.locator("#download-link");
    this.subscribeLink = page.locator("#subscribe-link");
    this.copyButton = page.locator("#copy-btn");
  }

  async navigate() {
    await this.page.goto("/demos/ical");
  }

  private field(fieldName: string): Locator {
    const fieldMap: Record<string, string> = {
      title: "#title",
      duration: "#duration",
      startat: "#startAt",
      cancelat: "#cancelAt",
      tz: "#tz",
    };

    const selector = fieldMap[fieldName.toLowerCase()];
    if (!selector) {
      throw new Error(`Unknown field: ${fieldName}`);
    }

    return this.form.locator(selector);
  }

  async fillField(fieldName: string, value: string) {
    await this.field(fieldName).fill(value);
  }

  async clearField(fieldName: string) {
    await this.field(fieldName).fill("");
  }

  async selectTimezone(timezone: string) {
    await this.field("tz").selectOption(timezone);
  }

  async setCancelAt(date: Date) {
    // Convert to datetime-local format: YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const dateTimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
    await this.field("cancelAt").fill(dateTimeLocal);
  }

  async clickButton(buttonText: string) {
    await this.page.getByRole("button", { name: buttonText, exact: true }).click();
  }

  async clickDownloadLink() {
    await this.downloadLink.click();
  }

  async getFeedUrl(): Promise<string> {
    await this.feedUrl.waitFor({ state: "visible" });
    return await this.feedUrl.inputValue();
  }

  async getDownloadLink(): Promise<string> {
    return (await this.downloadLink.getAttribute("href")) || "";
  }

  async getSubscribeLink(): Promise<string> {
    return (await this.subscribeLink.getAttribute("href")) || "";
  }
}
