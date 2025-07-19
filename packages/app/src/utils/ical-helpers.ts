import revHash from "rev-hash";
import type { EventQueryParams, ParsedEvent, ICalOptions } from "../types/events.ts";

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
  const durationMin = parseInt(duration, 10);
  if (isNaN(durationMin) || durationMin <= 0) {
    return { error: "Invalid duration: must be a positive number" };
  }

  // Parse dates
  let startDate: Date;
  try {
    startDate = new Date(startAt);
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid date");
    }
  } catch {
    return { error: "Invalid startAt: must be a valid ISO 8601 datetime" };
  }

  const endDate = new Date(startDate.getTime() + durationMin * 60000);

  // Parse cancelAt if provided
  let cancelAtDate: Date | null = null;
  if (cancelAt) {
    try {
      cancelAtDate = new Date(cancelAt);
      if (isNaN(cancelAtDate.getTime())) {
        throw new Error("Invalid date");
      }
    } catch {
      return { error: "Invalid cancelAt: must be a valid ISO 8601 datetime" };
    }
  }

  // Determine cancellation status
  const now = new Date();
  const isCancelled = cancelAtDate ? now >= cancelAtDate : false;

  // Generate stable UID using hash of stable properties
  // This ensures the same event always has the same UID
  const uidBase = `${title}-${startAt}`;
  const uid = `${revHash(uidBase)}@hello-world-web.local`;

  // Determine iCalendar options based on state
  const icalOptions: ICalOptions = {
    method: isCancelled ? 'CANCEL' : 'PUBLISH',
    status: isCancelled ? 'CANCELLED' : 'CONFIRMED',
    sequence: isCancelled ? 1 : 0, // Increment sequence for updates
    isCancelled,
  };

  return {
    title,
    startAt,
    duration: durationMin,
    timezone: tz,
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
export function addVendorExtensions(event: any, options: ICalOptions): void {
  // Microsoft Outlook specific
  // Outlook may need explicit busy status for cancelled events
  if (options.isCancelled) {
    event.x('X-MICROSOFT-CDO-BUSYSTATUS', 'FREE');
  } else {
    event.x('X-MICROSOFT-CDO-BUSYSTATUS', 'BUSY');
  }

  // Apple Calendar specific
  // Apple handles cancellations better with this hint
  if (options.isCancelled) {
    event.x('X-APPLE-TRAVEL-ADVISORY-BEHAVIOR', 'AUTOMATIC');
  }

  // Google Calendar hint for refresh interval
  // Non-standard but may help with Google's slow refresh
  event.x('X-GOOGLE-REFRESH-INTERVAL', 'PT1H'); // 1 hour hint
}