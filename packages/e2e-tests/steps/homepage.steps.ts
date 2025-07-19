import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import * as semver from 'semver';

const { When, Then } = createBdd();

Then('the server config details should be collapsed', async ({ page }) => {
  const details = page.locator('details:has(summary:has-text("server config"))');
  await expect(details).not.toHaveAttribute('open');
});

Then('the server config details should be expanded', async ({ page }) => {
  const details = page.locator('details:has(summary:has-text("server config"))');
  await expect(details).toHaveAttribute('open', '');
});

When('I click on the server config summary', async ({ page }) => {
  const summary = page.locator('summary:has-text("server config")');
  await summary.click();
});

Then('I should see server config JSON with the following properties:', async ({ page }, dataTable: any) => {
  const pre = page.locator('details:has(summary:has-text("server config")) pre');
  await expect(pre).toBeVisible();
  
  const jsonText = await pre.textContent();
  const json = JSON.parse(jsonText!);
  
  const expectedProperties = dataTable.hashes();
  
  for (const row of expectedProperties) {
    const { property } = row;
    
    switch (property) {
      case 'basePath':
        expect(json).toHaveProperty('basePath', '/');
        break;
      
      case 'startupTime':
        expect(json).toHaveProperty('startupTime');
        const date = new Date(json.startupTime);
        expect(date.toISOString()).toBe(json.startupTime);
        break;
      
      case 'version':
        expect(json).toHaveProperty('version');
        const version = semver.parse(json.version);
        expect(version).toBeTruthy();
        expect(version!.major).toBeGreaterThan(0);
        break;
    }
  }
});