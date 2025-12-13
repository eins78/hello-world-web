import type { Page, Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly title: Locator;
  readonly serverConfigDetails: Locator;
  readonly serverConfigSummary: Locator;
  readonly serverConfigPre: Locator;
  readonly themeToggle: Locator;
  readonly lightThemeButton: Locator;
  readonly darkThemeButton: Locator;
  readonly systemThemeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator("h1");
    this.serverConfigDetails = page.locator('details:has(summary:has-text("server config"))');
    this.serverConfigSummary = page.locator('summary:has-text("server config")');
    this.serverConfigPre = this.serverConfigDetails.locator("pre");
    this.themeToggle = page.locator("theme-toggle");
    this.lightThemeButton = this.themeToggle.locator('button:has-text("Light")');
    this.darkThemeButton = this.themeToggle.locator('button:has-text("Dark")');
    this.systemThemeButton = this.themeToggle.locator('button:has-text("System")');
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

  async isThemeToggleVisible() {
    return await this.themeToggle.isVisible();
  }

  async clickLightTheme() {
    await this.lightThemeButton.click();
  }

  async clickDarkTheme() {
    await this.darkThemeButton.click();
  }

  async clickSystemTheme() {
    await this.systemThemeButton.click();
  }

  async isLightThemeActive() {
    const className = await this.lightThemeButton.getAttribute("class");
    return className?.includes("active") ?? false;
  }

  async isDarkThemeActive() {
    const className = await this.darkThemeButton.getAttribute("class");
    return className?.includes("active") ?? false;
  }

  async isSystemThemeActive() {
    const className = await this.systemThemeButton.getAttribute("class");
    return className?.includes("active") ?? false;
  }

  async getDataTheme() {
    return await this.page.locator("html").getAttribute("data-theme");
  }

  async getBackgroundColor() {
    return await this.page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
  }
}
