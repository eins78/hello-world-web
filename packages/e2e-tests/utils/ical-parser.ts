/**
 * iCalendar parsing utilities for E2E tests
 * Provides wrapper functions around ical.js for testing iCal feeds
 */

import ICAL from "ical.js";
import fetch from "node-fetch";

export interface ParsedEvent {
  uid: string;
  summary: string;
  dtstart: Date;
  dtend: Date;
  status: string;
  sequence: number;
  timezone?: string;
  method?: string;
  vendorExtensions: Record<string, string>;
}

export interface ParsedCalendar {
  version: string;
  prodid: string;
  method?: string;
  events: ParsedEvent[];
  hasTimezone: boolean;
  timezoneId?: string;
}

/**
 * Fetches and parses an iCalendar feed from a URL
 */
export async function fetchAndParseICalFeed(url: string): Promise<ParsedCalendar> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch iCal feed: ${response.status} ${response.statusText}`);
  }

  const icalData = await response.text();
  return parseICalendarData(icalData);
}

/**
 * Parses raw iCalendar data into structured format
 */
export function parseICalendarData(icalData: string): ParsedCalendar {
  const jcalData = ICAL.parse(icalData);
  const comp = new ICAL.Component(jcalData);

  // Extract calendar properties
  const version = comp.getFirstPropertyValue("version");
  const prodid = comp.getFirstPropertyValue("prodid");
  const method = comp.getFirstPropertyValue("method");

  // Check for VTIMEZONE
  const timezoneComps = comp.getAllSubcomponents("vtimezone");
  const hasTimezone = timezoneComps.length > 0;
  const timezoneId = hasTimezone && timezoneComps[0] ? timezoneComps[0].getFirstPropertyValue("tzid") : undefined;

  // Parse events
  const events: ParsedEvent[] = [];
  const veventComps = comp.getAllSubcomponents("vevent");

  for (const veventComp of veventComps) {
    const event = new ICAL.Event(veventComp);

    // Extract vendor extensions (X- properties)
    const vendorExtensions: Record<string, string> = {};
    const properties = veventComp.getAllProperties();

    for (const prop of properties) {
      if (prop.name.startsWith("x-")) {
        vendorExtensions[prop.name] = String(prop.getFirstValue());
      }
    }

    events.push({
      uid: event.uid,
      summary: event.summary,
      dtstart: event.startDate.toJSDate(),
      dtend: event.endDate.toJSDate(),
      status: String(veventComp.getFirstPropertyValue("status") || "CONFIRMED"),
      sequence: Number(veventComp.getFirstPropertyValue("sequence") || 0),
      timezone: event.startDate.zone?.tzid,
      vendorExtensions,
    });
  }

  return {
    version: String(version),
    prodid: String(prodid),
    method: method ? String(method) : undefined,
    events,
    hasTimezone,
    timezoneId: timezoneId ? String(timezoneId) : undefined,
  };
}

/**
 * Validates basic RFC 5545 compliance
 */
export function validateRFC5545Compliance(calendar: ParsedCalendar): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required calendar properties
  if (calendar.version !== "2.0") {
    errors.push(`Invalid VERSION: expected "2.0", got "${calendar.version}"`);
  }

  if (!calendar.prodid) {
    errors.push("Missing required PRODID property");
  }

  // Check events
  for (const event of calendar.events) {
    if (!event.uid) {
      errors.push("Event missing required UID property");
    }

    if (!event.summary) {
      errors.push("Event missing required SUMMARY property");
    }

    if (!event.dtstart) {
      errors.push("Event missing required DTSTART property");
    }

    if (!event.dtend) {
      errors.push("Event missing required DTEND property");
    }

    // Validate sequence number
    if (event.sequence < 0) {
      errors.push(`Invalid SEQUENCE: must be non-negative, got ${event.sequence}`);
    }

    // Validate status values
    const validStatuses = ["TENTATIVE", "CONFIRMED", "CANCELLED"];
    if (event.status && !validStatuses.includes(event.status)) {
      errors.push(`Invalid STATUS: "${event.status}"`);
    }
  }

  // Check timezone requirements
  for (const event of calendar.events) {
    if (event.timezone && event.timezone !== "UTC" && !calendar.hasTimezone) {
      errors.push(`Event uses timezone "${event.timezone}" but no VTIMEZONE component found`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks for expected vendor extensions
 */
export function validateVendorExtensions(
  event: ParsedEvent,
  expectedExtensions: Record<string, string | RegExp>,
): boolean {
  for (const [key, expectedValue] of Object.entries(expectedExtensions)) {
    const actualValue = event.vendorExtensions[key];

    if (!actualValue) {
      return false;
    }

    if (expectedValue instanceof RegExp) {
      if (!expectedValue.test(actualValue)) {
        return false;
      }
    } else {
      if (actualValue !== expectedValue) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Generates test event parameters
 */
export function generateTestEventParams(
  overrides?: Partial<{
    title: string;
    startAt: string;
    duration: number;
    tz?: string;
    cancelAt?: string;
  }>,
): URLSearchParams {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 30, 0, 0);

  const defaults = {
    title: "Test Event",
    startAt: tomorrow.toISOString(),
    duration: 60,
    ...overrides,
  };

  const params = new URLSearchParams();
  params.append("title", defaults.title);
  params.append("startAt", defaults.startAt);
  params.append("duration", defaults.duration.toString());

  if (defaults.tz) {
    params.append("tz", defaults.tz);
  }

  if (defaults.cancelAt) {
    params.append("cancelAt", defaults.cancelAt);
  }

  return params;
}
