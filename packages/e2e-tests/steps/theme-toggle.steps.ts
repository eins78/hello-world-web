import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { HomePage } from "../pages/HomePage.ts";

const { When, Then } = createBdd();

Then("the theme toggle should be visible", async ({ page }) => {
  const homePage = new HomePage(page);
  expect(await homePage.isThemeToggleVisible()).toBe(true);
});

Then("the System theme button should be active", async ({ page }) => {
  const homePage = new HomePage(page);
  expect(await homePage.isSystemThemeActive()).toBe(true);
});

Then("the Light theme button should be active", async ({ page }) => {
  const homePage = new HomePage(page);
  expect(await homePage.isLightThemeActive()).toBe(true);
});

Then("the Dark theme button should be active", async ({ page }) => {
  const homePage = new HomePage(page);
  expect(await homePage.isDarkThemeActive()).toBe(true);
});

When("I click on the Light theme button", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.clickLightTheme();
});

When("I click on the Dark theme button", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.clickDarkTheme();
});

When("I click on the System theme button", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.clickSystemTheme();
});

Then("the page should use the light theme", async ({ page }) => {
  const homePage = new HomePage(page);
  const dataTheme = await homePage.getDataTheme();
  expect(dataTheme).toBe("light");
});

Then("the page should use the dark theme", async ({ page }) => {
  const homePage = new HomePage(page);
  const dataTheme = await homePage.getDataTheme();
  expect(dataTheme).toBe("dark");
});

Then("the data-theme attribute should be removed", async ({ page }) => {
  const homePage = new HomePage(page);
  const dataTheme = await homePage.getDataTheme();
  expect(dataTheme).toBeNull();
});

When("I reload the page", async ({ page }) => {
  await page.reload();
});
