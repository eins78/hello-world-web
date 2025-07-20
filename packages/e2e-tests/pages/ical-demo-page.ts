import { Page } from "@playwright/test";

export class ICalDemoPage {
  // eslint-disable-next-line no-unused-vars
  constructor(private page: Page) {
    // Store page instance for all methods
  }

  async navigate() {
    await this.page.goto("/demos/ical");
  }

  async fillField(fieldName: string, value: string) {
    const fieldMap: Record<string, string> = {
      title: "#title",
      duration: "#duration",
    };

    const selector = fieldMap[fieldName.toLowerCase()];
    if (!selector) {
      throw new Error(`Unknown field: ${fieldName}`);
    }

    await this.page.fill(selector, value);
  }

  async clearField(fieldName: string) {
    const fieldMap: Record<string, string> = {
      title: "#title",
      duration: "#duration",
    };

    const selector = fieldMap[fieldName.toLowerCase()];
    if (!selector) {
      throw new Error(`Unknown field: ${fieldName}`);
    }

    await this.page.fill(selector, "");
  }

  async selectTimezone(timezone: string) {
    await this.page.selectOption("#tz", timezone);
  }

  async setCancelAt(date: Date) {
    // Convert to datetime-local format: YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const dateTimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
    await this.page.fill("#cancelAt", dateTimeLocal);
  }

  async clickButton(buttonText: string) {
    await this.page.click(`button:has-text("${buttonText}")`);
  }

  async clickDownloadLink() {
    await this.page.click("#download-link");
  }

  async getFeedUrl(): Promise<string> {
    await this.page.waitForSelector("#feed-url", { state: "visible" });
    return await this.page.inputValue("#feed-url");
  }

  async getDownloadLink(): Promise<string> {
    return (await this.page.getAttribute("#download-link", "href")) || "";
  }

  async getSubscribeLink(): Promise<string> {
    return (await this.page.getAttribute("#subscribe-link", "href")) || "";
  }

  async isResultVisible(): Promise<boolean> {
    const resultDiv = this.page.locator("#result");
    const classes = (await resultDiv.getAttribute("class")) || "";
    return !classes.includes("d-none");
  }
}
