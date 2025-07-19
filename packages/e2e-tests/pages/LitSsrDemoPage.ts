import { Page, Locator } from "@playwright/test";

export class LitSsrDemoPage {
  readonly page: Page;
  readonly title: Locator;
  readonly simpleCounter: SimpleCounterComponent;
  readonly epochCounter: EpochCounterComponent;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator("h1");
    this.simpleCounter = new SimpleCounterComponent(page);
    this.epochCounter = new EpochCounterComponent(page);
  }

  async goto() {
    await this.page.goto("/lit-ssr-demo");
  }

  async getTitle() {
    return await this.title.textContent();
  }
}

class SimpleCounterComponent {
  readonly page: Page;
  readonly element: Locator;
  readonly countDisplay: Locator;
  readonly button: Locator;

  constructor(page: Page) {
    this.page = page;
    this.element = page.locator("simple-counter");
    this.countDisplay = this.element.locator("#count");
    this.button = this.element.locator("button");
  }

  async getCount() {
    const text = await this.countDisplay.textContent();
    return parseInt(text!, 10);
  }

  async waitForHydration() {
    await this.button.waitFor({ state: "attached" });
    await this.page.waitForFunction(
      (selector) => !document.querySelector(selector)?.hasAttribute("disabled"),
      "simple-counter button",
    );
  }

  async increment() {
    await this.button.click();
  }

  async getAttribute(name: string) {
    return await this.element.getAttribute(name);
  }
}

class EpochCounterComponent {
  readonly page: Page;
  readonly element: Locator;
  readonly timeDisplay: Locator;
  readonly button: Locator;

  constructor(page: Page) {
    this.page = page;
    this.element = page.locator("epoch-counter");
    this.timeDisplay = this.element.locator("time");
    this.button = this.element.locator("button");
  }

  async getEpochValue() {
    const text = await this.timeDisplay.textContent();
    return parseInt(text!, 10);
  }

  async waitForHydration() {
    await this.button.waitFor({ state: "attached" });
    await this.page.waitForFunction(
      (selector) => !document.querySelector(selector)?.hasAttribute("disabled"),
      "epoch-counter button",
    );
  }

  async increment() {
    await this.button.click();
  }

  async hasAttribute(name: string) {
    const attr = await this.element.getAttribute(name);
    return attr !== null;
  }
}
