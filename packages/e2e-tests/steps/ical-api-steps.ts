import { expect } from "@playwright/test";
import { createBdd, DataTable } from "playwright-bdd";
import fetch from "node-fetch";
import {
  parseICalendarData,
  validateRFC5545Compliance,
  validateVendorExtensions,
  ParsedCalendar,
} from "../utils/ical-parser.ts";

const { When, Then } = createBdd();

interface TestContext {
  response?: Response;
  responseText?: string;
  parsedCalendar?: ParsedCalendar;
}

// Store test context per scenario
const testContext: TestContext = {};

When("I request the iCal API with parameters:", async ({ page }, dataTable: DataTable) => {
  const params = new URLSearchParams();
  const data = dataTable.hashes();

  for (const row of data) {
    if (row.parameter && row.value) {
      params.append(row.parameter, row.value);
    }
  }

  const baseUrl = page.url().replace(/\/[^/]*$/, "");
  const apiUrl = `${baseUrl}/api/ical/events.ics?${params.toString()}`;

  testContext.response = (await fetch(apiUrl)) as unknown as Response;
  testContext.responseText = await testContext.response!.text();

  // Parse if successful
  if (testContext.response!.ok) {
    try {
      testContext.parsedCalendar = parseICalendarData(testContext.responseText);
    } catch {
      // Invalid iCal data
    }
  }
});

Then("I should receive a {int} response", async (_page, statusCode: number) => {
  expect(testContext.response?.status).toBe(statusCode);
});

Then("the Content-Type should be {string}", async (_page, contentType: string) => {
  const actualContentType = testContext.response?.headers.get("content-type");
  expect(actualContentType).toBe(contentType);
});

Then("the response should contain {string}", async (_page, expectedContent: string) => {
  expect(testContext.responseText).toContain(expectedContent);
});

Then("the iCalendar data should be RFC 5545 compliant", async (_page) => {
  expect(testContext.parsedCalendar).toBeTruthy();

  const validation = validateRFC5545Compliance(testContext.parsedCalendar!);
  if (!validation.isValid) {
    throw new Error(`RFC 5545 validation failed:\n${validation.errors.join("\n")}`);
  }

  expect(validation.isValid).toBe(true);
});

Then("the calendar should have version {string}", async (_page, version: string) => {
  expect(testContext.parsedCalendar?.version).toBe(version);
});

Then("the calendar should have a PRODID property", async (_page) => {
  expect(testContext.parsedCalendar?.prodid).toBeTruthy();
  expect(testContext.parsedCalendar?.prodid).toContain("Hello World Web");
});

Then("the event should have a consistent UID", async (_page) => {
  expect(testContext.parsedCalendar?.events).toHaveLength(1);
  const event = testContext.parsedCalendar!.events[0];
  if (!event) {
    throw new Error("No event found in parsed calendar");
  }

  expect(event.uid).toBeTruthy();
  expect(event.uid).toMatch(/@hello-world-web\.local$/);
});

Then(
  "the event should have vendor extension {string} with value {string}",
  async (_page, extensionName: string, expectedValue: string) => {
    expect(testContext.parsedCalendar?.events).toHaveLength(1);
    const event = testContext.parsedCalendar!.events[0];
    if (!event) {
      throw new Error("No event found in parsed calendar");
    }

    const hasExtension = validateVendorExtensions(event, {
      [extensionName]: expectedValue,
    });

    expect(hasExtension).toBe(true);
  },
);

// Override Response type for test context
type Response = {
  status: number;
  headers: {
    get(_name: string): string | null;
  };
  text(): Promise<string>;
  ok: boolean;
};
