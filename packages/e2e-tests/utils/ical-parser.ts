/**
 * iCalendar parsing utilities for E2E tests
 * Provides wrapper functions around ical.js for testing iCal feeds
 */

import ICAL from "ical.js";

export interface ParsedEvent {
  uid: string;
  summary: string;
  dtstart: Date;
  dtend: Date;
  status: string;
  sequence: number;
  timezone?: string;
  vendorExtensions: Record<string, string>;
}

export interface ParsedCalendar {
  version: string;
  prodid: string;
  method?: string;
  events: ParsedEvent[];
  hasTimezone: boolean;
  timezoneIds: string[];
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

  // Register VTIMEZONE components so that TZID references on event times resolve
  const timezoneIds: string[] = [];
  for (const tzComp of comp.getAllSubcomponents("vtimezone")) {
    const tz = new ICAL.Timezone(tzComp);
    timezoneIds.push(tz.tzid);
    if (!ICAL.TimezoneService.has(tz.tzid)) {
      ICAL.TimezoneService.register(tz);
    }
  }

  // Parse events
  const events: ParsedEvent[] = [];

  for (const veventComp of comp.getAllSubcomponents("vevent")) {
    const event = new ICAL.Event(veventComp);

    // Extract vendor extensions (X- properties)
    const vendorExtensions: Record<string, string> = {};
    for (const prop of veventComp.getAllProperties()) {
      if (prop.name.startsWith("x-")) {
        vendorExtensions[prop.name] = String(prop.getFirstValue());
      }
    }

    // TZID parameter of DTSTART (if any)
    const tzid = veventComp.getFirstProperty("dtstart")?.getParameter("tzid");

    events.push({
      uid: event.uid,
      summary: event.summary,
      dtstart: event.startDate.toJSDate(),
      dtend: event.endDate.toJSDate(),
      status: String(veventComp.getFirstPropertyValue("status") || "CONFIRMED"),
      sequence: Number(veventComp.getFirstPropertyValue("sequence") || 0),
      timezone: typeof tzid === "string" ? tzid : undefined,
      vendorExtensions,
    });
  }

  return {
    version: String(version),
    prodid: String(prodid),
    method: method ? String(method) : undefined,
    events,
    hasTimezone: timezoneIds.length > 0,
    timezoneIds,
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

    // RFC 5545 3.2.19: a TZID parameter must reference a VTIMEZONE component in the same object
    if (event.timezone && !calendar.timezoneIds.includes(event.timezone)) {
      errors.push(`Event uses TZID "${event.timezone}" but no matching VTIMEZONE component found`);
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
