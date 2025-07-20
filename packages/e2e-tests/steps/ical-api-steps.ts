import { expect, type APIResponse } from "@playwright/test";
import { createBdd, DataTable } from "playwright-bdd";
import {
  parseICalendarData,
  validateRFC5545Compliance,
  validateVendorExtensions,
  type ParsedCalendar,
} from "../utils/ical-parser.ts";
import { getTestData } from "../utils/test-data.ts";

const { When, Then } = createBdd();

interface ApiTestData {
  params: Record<string, string>;
  response: APIResponse;
  responseText: string;
  parsedCalendar: ParsedCalendar;
}

When("I request the iCal API with parameters:", async ({ page, request }, dataTable: DataTable) => {
  const params: Record<string, string> = {};
  for (const row of dataTable.hashes()) {
    if (row.parameter && row.value) {
      params[row.parameter] = row.value;
    }
  }

  // The `request` fixture resolves relative URLs against the configured baseURL,
  // so this works against the local dev server, CI and the Docker container alike.
  const response = await request.get("/api/ical/events.ics", { params });
  const data = getTestData<ApiTestData>(page);
  data.params = params;
  data.response = response;
  data.responseText = await response.text();

  if (response.ok()) {
    // A successful response must be parseable iCalendar data; let parse errors fail the test
    data.parsedCalendar = parseICalendarData(data.responseText);
  }
});

Then("I should receive a {int} response", async ({ page }, statusCode: number) => {
  const { response } = getTestData<ApiTestData>(page);
  expect(response?.status()).toBe(statusCode);
});

Then("the Content-Type should be {string}", async ({ page }, contentType: string) => {
  const { response } = getTestData<ApiTestData>(page);
  expect(response?.headers()["content-type"]).toBe(contentType);
});

Then("the response should contain {string}", async ({ page }, expectedContent: string) => {
  const { responseText } = getTestData<ApiTestData>(page);
  expect(responseText).toContain(expectedContent);
});

Then("the response should not contain {string}", async ({ page }, unexpectedContent: string) => {
  const { responseText } = getTestData<ApiTestData>(page);
  expect(responseText).not.toContain(unexpectedContent);
});

Then("the iCalendar data should be RFC 5545 compliant", async ({ page }) => {
  const { parsedCalendar } = getTestData<ApiTestData>(page);
  expect(parsedCalendar).toBeTruthy();

  const validation = validateRFC5545Compliance(parsedCalendar!);
  expect(validation.errors, "RFC 5545 validation errors").toEqual([]);
  expect(validation.isValid).toBe(true);
});

Then("the calendar should have version {string}", async ({ page }, version: string) => {
  const { parsedCalendar } = getTestData<ApiTestData>(page);
  expect(parsedCalendar?.version).toBe(version);
});

Then("the calendar should have a PRODID property", async ({ page }) => {
  const { parsedCalendar } = getTestData<ApiTestData>(page);
  expect(parsedCalendar?.prodid).toBeTruthy();
  expect(parsedCalendar?.prodid).toContain("Hello World Web");
});

Then("the event UID should be the same on a repeated request", async ({ page, request }) => {
  const { parsedCalendar, params } = getTestData<ApiTestData>(page);
  expect(parsedCalendar?.events).toHaveLength(1);
  const event = parsedCalendar!.events[0]!;
  expect(event.uid).toMatch(/@hello-world-web\.local$/);

  // Clients track updates by UID, so the same parameters must always yield the same UID
  const repeated = parseICalendarData(await (await request.get("/api/ical/events.ics", { params })).text());
  expect(repeated.events[0]?.uid).toBe(event.uid);
});

Then(
  "the event should have vendor extension {string} with value {string}",
  async ({ page }, extensionName: string, expectedValue: string) => {
    const { parsedCalendar } = getTestData<ApiTestData>(page);
    expect(parsedCalendar?.events).toHaveLength(1);
    const event = parsedCalendar!.events[0]!;

    const hasExtension = validateVendorExtensions(event, {
      [extensionName]: expectedValue,
    });

    expect(hasExtension).toBe(true);
  },
);
