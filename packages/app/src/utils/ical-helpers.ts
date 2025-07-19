import revHash from "rev-hash";
import { ICalCalendarMethod, ICalEventStatus, type ICalEvent } from "ical-generator";
import type { EventQueryParams, ParsedEvent, ICalOptions } from "../types/events.ts";

const MIN_DURATION_MINUTES = 1;
const MILLISECONDS_PER_MINUTE = 60_000;

/** Domain part of generated UIDs */
const UID_DOMAIN = "hello-world-web.local";

/**
 * Checks whether `tz` is an IANA timezone identifier known to the runtime (e.g. "Europe/Zurich")
 */
function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
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

  // Parse duration
  const durationMin = Number(duration);
  if (!Number.isInteger(durationMin) || durationMin < MIN_DURATION_MINUTES) {
    return { error: "Invalid duration: must be a positive whole number of minutes" };
  }

  // Parse dates. Note: a datetime without offset/"Z" is interpreted in the server's local timezone.
  const startDate = new Date(startAt);
  if (Number.isNaN(startDate.getTime())) {
    return { error: "Invalid startAt: must be a valid ISO 8601 datetime" };
  }

  const endDate = new Date(startDate.getTime() + durationMin * MILLISECONDS_PER_MINUTE);

  // Validate timezone if provided (empty string means UTC)
  if (tz && !isValidTimeZone(tz)) {
    return { error: "Invalid tz: must be an IANA timezone identifier (e.g. Europe/Zurich)" };
  }

  // Parse cancelAt if provided
  let cancelAtDate: Date | null = null;
  if (cancelAt) {
    cancelAtDate = new Date(cancelAt);
    if (Number.isNaN(cancelAtDate.getTime())) {
      return { error: "Invalid cancelAt: must be a valid ISO 8601 datetime" };
    }
  }

  // Determine cancellation status
  const now = new Date();
  const isCancelled = cancelAtDate ? now >= cancelAtDate : false;

  // Generate stable UID using hash of stable properties
  // This ensures the same event always has the same UID
  const uidBase = `${title}-${startAt}`;
  const uid = `${revHash(uidBase)}@${UID_DOMAIN}`;

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
    timezone: tz || undefined,
    cancelAt,
    startDate,
    endDate,
    uid,
    icalOptions,
  };
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
  // Apple handles cancellations better with this hint
  if (options.isCancelled) {
    event.x("X-APPLE-TRAVEL-ADVISORY-BEHAVIOR", "AUTOMATIC");
  }

  // Google Calendar hint for refresh interval
  // Non-standard but may help with Google's slow refresh
  event.x("X-GOOGLE-REFRESH-INTERVAL", "PT1H"); // 1 hour hint
}
