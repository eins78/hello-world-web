import { Page, Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly title: Locator;
  readonly serverConfigDetails: Locator;
  readonly serverConfigSummary: Locator;
  readonly serverConfigPre: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator("h1");
    this.serverConfigDetails = page.locator('details:has(summary:has-text("server config"))');
    this.serverConfigSummary = page.locator('summary:has-text("server config")');
    this.serverConfigPre = this.serverConfigDetails.locator("pre");
  }

  async goto() {
    await this.page.goto("/");
  }

  async getTitle() {
    return await this.title.textContent();
  }

  async isServerConfigExpanded() {
    return (await this.serverConfigDetails.getAttribute("open")) !== null;
  }

  async toggleServerConfig() {
    await this.serverConfigSummary.click();
  }

  async getServerConfigJson() {
    const jsonText = await this.serverConfigPre.textContent();
    return JSON.parse(jsonText!);
  }
}
