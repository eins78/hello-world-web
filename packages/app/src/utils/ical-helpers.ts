import { createHash } from "node:crypto";
import { TZDate } from "@date-fns/tz";
import { getVtimezoneComponent } from "@touch4it/ical-timezones";
import ical, { ICalCalendarMethod, ICalEventStatus, type ICalCalendar, type ICalEvent } from "ical-generator";
import type { EventQueryParams, ParsedEvent, ICalOptions } from "../types/events.ts";

const MIN_DURATION_MINUTES = 1;
/** One (leap) year; keeps `endDate` a valid Date and feeds sane */
const MAX_DURATION_MINUTES = 366 * 24 * 60;
const MILLISECONDS_PER_MINUTE = 60_000;

/** Domain part of generated UIDs */
const UID_DOMAIN = "hello-world-web.local";

/** Suggested refresh interval for subscribed calendars, in seconds (RFC 7986 REFRESH-INTERVAL + X-PUBLISHED-TTL) */
const REFRESH_INTERVAL_SECONDS = 60 * 60;

/** ISO 8601 date-time with an explicit `Z` or UTC offset, e.g. `2025-08-01T14:30:00Z` or `2025-08-01T16:30+02:00` */
const ISO_DATETIME_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

/** Timezone identifiers that mean "UTC": times are written with a `Z` suffix and need no VTIMEZONE */
const UTC_TIMEZONE_IDS = new Set(["UTC", "Etc/UTC"]);

/**
 * Picks the string-valued entries of an Express query object (repeated or nested parameters are ignored)
 */
export function pickQueryStrings(query: Record<string, unknown>): EventQueryParams {
  const pick = (key: keyof EventQueryParams): string | undefined => {
    const value = query[key];
    return typeof value === "string" ? value : undefined;
  };
  return {
    title: pick("title"),
    startAt: pick("startAt"),
    duration: pick("duration"),
    tz: pick("tz"),
    cancelAt: pick("cancelAt"),
  };
}

/**
 * Parses an ISO 8601 date-time that carries its own offset (or `Z`).
 * Values without offset are rejected on purpose: `new Date()` would interpret them in the
 * server's local timezone, which differs between development machines and Docker/CI (UTC).
 */
function parseInstant(value: string): Date | null {
  if (!ISO_DATETIME_WITH_OFFSET.test(value)) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Resolves the `tz` parameter to a timezone identifier we can emit a VTIMEZONE component for.
 *
 * - `undefined`: UTC was requested; times are written with a `Z` suffix and no VTIMEZONE is needed
 * - a string: `@touch4it/ical-timezones` provides VTIMEZONE data under exactly this identifier
 * - `null`: unknown identifier, or an alias/legacy name (`Asia/Calcutta`, `EST`, `europe/zurich`) that
 *   would produce a `TZID` parameter without a matching VTIMEZONE component (invalid per RFC 5545 3.2.19)
 */
function resolveTimeZone(tz: string): string | null | undefined {
  if (UTC_TIMEZONE_IDS.has(tz)) {
    return undefined;
  }
  const vtimezone = getVtimezoneComponent(tz);
  if (!vtimezone) {
    return null;
  }
  const tzid = vtimezone.match(/^TZID:(.+)$/m)?.[1]?.trim();
  return tzid === tz ? tz : null;
}

/**
 * Parse and validate query parameters for event generation
 * This is exported for unit testing
 */
export function parseEventParams(query: EventQueryParams): ParsedEvent | { error: string } {
  const { title, startAt, duration, tz, cancelAt } = query;

  // Validate required parameters
  if (!title) {
    return { error: "Missing required parameter: title" };
  }
  if (!startAt) {
    return { error: "Missing required parameter: startAt" };
  }
  if (!duration) {
    return { error: "Missing required parameter: duration" };
  }

  // Parse duration (digits only: no signs, exponents, hex or fractions)
  const durationMin = /^\d+$/.test(duration) ? Number(duration) : Number.NaN;
  if (!(durationMin >= MIN_DURATION_MINUTES && durationMin <= MAX_DURATION_MINUTES)) {
    return {
      error: `Invalid duration: must be a whole number of minutes between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES}`,
    };
  }

  // Parse dates
  const startDate = parseInstant(startAt);
  if (!startDate) {
    return {
      error: "Invalid startAt: must be an ISO 8601 datetime with timezone offset or Z (e.g. 2025-08-01T14:30:00Z)",
    };
  }

  const endDate = new Date(startDate.getTime() + durationMin * MILLISECONDS_PER_MINUTE);

  // Resolve timezone if provided (empty string means UTC)
  let timezone: string | undefined;
  if (tz) {
    const resolved = resolveTimeZone(tz);
    if (resolved === null) {
      return { error: "Invalid tz: must be an IANA timezone identifier with VTIMEZONE data (e.g. Europe/Zurich)" };
    }
    timezone = resolved;
  }

  // Parse cancelAt if provided
  let cancelAtDate: Date | null = null;
  if (cancelAt) {
    cancelAtDate = parseInstant(cancelAt);
    if (!cancelAtDate) {
      return { error: "Invalid cancelAt: must be an ISO 8601 datetime with timezone offset or Z" };
    }
  }

  // Determine cancellation status
  const now = new Date();
  const isCancelled = cancelAtDate ? now >= cancelAtDate : false;

  // Generate a stable UID from the stable properties (title and the normalized start instant),
  // so that the same event always has the same UID regardless of how startAt was spelled
  const uidHash = createHash("sha256").update(`${title}\n${startDate.toISOString()}`).digest("hex").slice(0, 16);
  const uid = `${uidHash}@${UID_DOMAIN}`;

  // Determine iCalendar options based on state
  const icalOptions: ICalOptions = {
    method: isCancelled ? ICalCalendarMethod.CANCEL : ICalCalendarMethod.PUBLISH,
    status: isCancelled ? ICalEventStatus.CANCELLED : ICalEventStatus.CONFIRMED,
    sequence: isCancelled ? 1 : 0, // Increment sequence for updates
    isCancelled,
  };

  return {
    title,
    startAt,
    duration: durationMin,
    timezone,
    cancelAt,
    startDate,
    endDate,
    uid,
    icalOptions,
  };
}

/**
 * Builds the iCalendar object for a parsed event
 */
export function createEventCalendar(event: ParsedEvent): ICalCalendar {
  const cal = ical({
    name: "Event Feed",
    prodId: {
      company: "Hello World Web",
      product: "Event Feed",
      language: "EN",
    },
    // Set calendar-level METHOD for proper client handling
    method: event.icalOptions.method,
    // Refresh hint for subscribed calendars; emitted as REFRESH-INTERVAL and X-PUBLISHED-TTL
    ttl: REFRESH_INTERVAL_SECONDS,
  });

  if (event.timezone) {
    // RFC 5545 (3.2.19): every TZID parameter MUST reference a VTIMEZONE component in the same
    // iCalendar object. ical-generator only emits VTIMEZONE components when a generator is
    // configured; @touch4it/ical-timezones provides one with the IANA zone rules.
    // The calendar-level timezone *name* is deliberately left unset: ical-generator would then
    // format DTSTAMP as floating local time, but RFC 5545 requires DTSTAMP in UTC.
    cal.timezone({ name: null, generator: getVtimezoneComponent });
    // Non-standard hint used by Apple and Google for the calendar's display timezone
    cal.x("X-WR-TIMEZONE", event.timezone);
  }

  // ical-generator formats plain Date objects with the *process* local time when an event timezone
  // is set, so the instants are wrapped in TZDate to get the wall-clock time of the requested zone.
  const inZone = (date: Date): Date => (event.timezone ? new TZDate(date, event.timezone) : date);

  const calEvent = cal.createEvent({
    id: event.uid,
    start: inZone(event.startDate),
    end: inZone(event.endDate),
    // Emits DTSTART/DTEND with a TZID parameter matching the VTIMEZONE component above
    timezone: event.timezone,
    summary: event.title,
    description: "Event generated by Hello World Web iCalendar demo",
    location: "Demo Location", // Fixed for demo
    organizer: {
      name: "Demo Organizer",
      email: "noreply@hello-world-web.local",
    },
    sequence: event.icalOptions.sequence,
    status: event.icalOptions.status,
    // Timestamp when this iCal was generated
    stamp: new Date(),
  });

  addVendorExtensions(calEvent, event.icalOptions);

  return cal;
}

/**
 * Add vendor-specific extensions for better client compatibility
 * These are documented workarounds for known client issues
 */
export function addVendorExtensions(event: ICalEvent, options: ICalOptions): void {
  // Microsoft Outlook specific
  // Outlook may need explicit busy status for cancelled events
  if (options.isCancelled) {
    event.x("X-MICROSOFT-CDO-BUSYSTATUS", "FREE");
  } else {
    event.x("X-MICROSOFT-CDO-BUSYSTATUS", "BUSY");
  }

  // Apple Calendar specific
  // Apple's travel-time advisory property; included as an example of an Apple-only X- property
  // (no known effect on cancellation handling, see docs/features/ical.md)
  if (options.isCancelled) {
    event.x("X-APPLE-TRAVEL-ADVISORY-BEHAVIOR", "AUTOMATIC");
  }
}
