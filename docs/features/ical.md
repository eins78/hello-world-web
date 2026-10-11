# iCalendar Feed Feature

## Overview

This feature provides a minimal iCalendar (.ics) feed implementation for testing calendar client compatibility and documenting vendor-specific workarounds. The implementation follows RFC 5545 (iCalendar) and RFC 5546 (iTIP) specifications while including pragmatic workarounds for real-world client behavior.

## Purpose

- Test iCalendar feeds with various calendar clients (Apple Calendar, Google Calendar, Outlook, etc.)
- Document vendor-specific quirks and workarounds in code
- Provide a simple demo for experimentation before implementing in production applications
- Ensure RFC compliance while maintaining practical compatibility

## API Endpoint

### GET `/api/ical/events.ics`

Generates a dynamic iCalendar feed for a single event.

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `title` | string | Yes | Event title/summary | `Team Meeting` |
| `startAt` | string | Yes | ISO 8601 datetime of the event start **with `Z` or UTC offset** (an instant). Values without offset are rejected, because they would be interpreted in the server's local timezone. | `2025-08-01T12:30:00Z` |
| `duration` | number | Yes | Duration in minutes (whole number, 1 … 527040 = one year) | `90` |
| `tz` | string | No | IANA timezone identifier for displaying the event (defaults to UTC). When specified, `DTSTART`/`DTEND` carry a `TZID` parameter and a matching `VTIMEZONE` component is included. Only identifiers with `VTIMEZONE` data under exactly that name are accepted; aliases and legacy names (`Asia/Calcutta`, `EST`, `europe/zurich`) are rejected with `400`. | `Europe/Zurich` |
| `cancelAt` | string | No | ISO 8601 datetime (with `Z` or offset) from which the event is reported as cancelled | `2025-07-31T12:00:00Z` |
| `cancelMethod` | string | No | Calendar `METHOD` for a cancelled event: `PUBLISH` (default) or `CANCEL`. Has no effect until `cancelAt` has passed. Any other value is rejected with `400`. See [Cancellation Logic](#cancellation-logic). | `CANCEL` |

#### Response

- **Content-Type**: `text/calendar; charset=utf-8; method=PUBLISH` (or `method=CANCEL`, matching the `METHOD` property as RFC 5545 section 8.1 requires)
- **Body**: Valid iCalendar data

#### Example Request

```
GET /api/ical/events.ics?title=Team%20Meeting&startAt=2025-08-01T12:30:00Z&duration=60&tz=Europe/Zurich
```

#### Example Response

```icalendar
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hello World Web//Event Feed//EN
METHOD:PUBLISH
REFRESH-INTERVAL;VALUE=DURATION:PT1H
X-PUBLISHED-TTL:PT1H
BEGIN:VTIMEZONE
TZID:Europe/Zurich
...
END:VTIMEZONE
BEGIN:VEVENT
UID:17dcafe2a29a33f7@hello-world-web.local
DTSTAMP:20250119T120000Z
DTSTART;TZID=Europe/Zurich:20250801T143000
DTEND;TZID=Europe/Zurich:20250801T153000
SUMMARY:Team Meeting
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
X-WR-TIMEZONE:Europe/Zurich
END:VCALENDAR
```

Note how `startAt=2025-08-01T12:30:00Z` is rendered as `14:30` local time in `Europe/Zurich` (UTC+2 in summer).

## Demo Page

### GET `/demos/ical`

Provides an HTML form for testing the iCalendar feed with different parameters.

Features:
- Input fields for all parameters
- Live preview of generated feed URL
- Copy-to-clipboard functionality
- Client-specific testing instructions

## Implementation Details

### UID Generation

Event UIDs are generated from a hash of the event's stable properties (title and the normalized start instant) to ensure consistency across requests. This allows calendar clients to properly track updates to the same event. `2025-08-01T14:30:00Z`, `2025-08-01T14:30:00.000Z` and `2025-08-01T16:30:00+02:00` all yield the same UID.

```typescript
const uidHash = createHash("sha256").update(`${title}\n${startDate.toISOString()}`).digest("hex").slice(0, 16);
const uid = `${uidHash}@hello-world-web.local`;
```

### Sequence Handling

- `SEQUENCE: 0` - Initial event (not cancelled)
- `SEQUENCE: 1` - Updated event (cancelled)

The sequence number increments when the event transitions to cancelled state, signaling to clients that this is an update to an existing event. This demo does not track other modifications: changing e.g. the duration keeps the same UID and `SEQUENCE: 0`, so clients may or may not pick up the change.

### Cancellation Logic

If `cancelAt` parameter is provided and the current time is past that timestamp:
- `STATUS: CANCELLED` (instead of CONFIRMED)
- `SEQUENCE: 1` (incremented)
- `METHOD: PUBLISH` by default, or `METHOD: CANCEL` with `cancelMethod=CANCEL`

**Default: `METHOD:PUBLISH` + `STATUS:CANCELLED`.** A subscribed feed is a published calendar, not a
scheduling message. `METHOD` carries iTIP (RFC 5546) semantics: `CANCEL` is what an organizer sends
to attendees to cancel a meeting invitation. Feeds therefore usually keep `METHOD:PUBLISH` and mark
the event itself as cancelled.

**Opt-in: `cancelMethod=CANCEL`** switches a cancelled event to `METHOD:CANCEL`, so that the two
variants can be compared in the same client. Before `cancelAt` has passed, the feed always uses
`METHOD:PUBLISH`. The demo page offers both variants as "Cancellation method".

```
GET /api/ical/events.ics?title=Team%20Meeting&startAt=2025-08-01T12:30:00Z&duration=60&cancelAt=2025-07-31T12:00:00Z&cancelMethod=CANCEL
```

## Client Compatibility

### Expected client behaviour (not yet verified)

The table below collects documented and commonly reported behaviour of each client. None of it has been verified against this implementation yet; use the manual testing checklist below and update this table with real results.

| Client | Version | Subscription | Import | Cancellation | Notes |
|--------|---------|--------------|--------|--------------|-------|
| Apple Calendar | macOS 14+ | ✅ | ✅ | ✅ | Refresh: 5min-1week |
| Google Calendar | Web | ✅ | ❌ | ✅ | Refresh: ~24h |
| Outlook Desktop | 2021+ | ✅ | ✅ | ✅ | Refresh: ~3h |
| Outlook.com | Web | ✅ | ✅ | ✅ | Refresh: 3-24h |
| Thunderbird | 115+ | ✅ | ✅ | ✅ | Manual refresh available |

### Known Vendor Quirks

#### Microsoft Outlook
- Reported to need `METHOD:CANCEL` for cancellation messages (iTIP e-mail invitations); whether this also matters for subscribed feeds is one of the things to test (`cancelMethod=CANCEL`)
- May show duplicate events if UID is not consistent
- Uses `X-MICROSOFT-CDO-BUSYSTATUS` for free/busy status in scheduling assistant

#### Google Calendar
- Slow refresh rate (~24 hours) for subscribed calendars
- May silently ignore invalid feeds
- **Ignores refresh interval hints** - reported to ignore `REFRESH-INTERVAL` / `X-PUBLISHED-TTL` to prevent server overload

#### Apple Calendar
- Displays cancelled events with strikethrough
- Supports configurable refresh intervals (5 minutes to 1 week)
- Handles VTIMEZONE data well
- Has synchronization issues with cancelled Exchange events that may remain visible

## RFC Compliance

The implementation follows:
- [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) - Internet Calendaring and Scheduling Core Object Specification (iCalendar)
- [RFC 5546](https://www.rfc-editor.org/rfc/rfc5546) - iCalendar Transport-Independent Interoperability Protocol (iTIP)

Key compliance points:
- Proper UID persistence across updates
- SEQUENCE increment on cancellation
- `METHOD:PUBLISH` for the feed, `METHOD:CANCEL` (iTIP) only on request, with a matching `method` Content-Type parameter
- VTIMEZONE components for non-UTC times
- STATUS property for event state

## Timezone Handling

Proper timezone handling is critical for iCalendar feeds to work correctly across different calendar clients and time zones.

### Implementation Approach

When a timezone is specified via the `tz` parameter, our implementation:

1. Validates the identifier by asking `@touch4it/ical-timezones` for its `VTIMEZONE` data and requiring the returned `TZID` to match exactly; unknown identifiers, aliases and legacy names are rejected with `400` (they would produce a `TZID` without a matching `VTIMEZONE`). `UTC` and `Etc/UTC` mean "no timezone".
2. Configures a `VTIMEZONE` generator on the calendar, because `ical-generator` only emits `VTIMEZONE` components when a generator is provided
3. Wraps the start/end instants in a zone-aware `TZDate` (`@date-fns/tz`) and sets the timezone on the event, so `DTSTART`/`DTEND` are written as the wall-clock time of that zone with a `TZID` parameter that references the generated `VTIMEZONE`. Plain `Date` objects would be formatted in the *server's* local time, which differs between development machines and Docker/CI (UTC).
4. Adds the non-standard `X-WR-TIMEZONE` hint used by Apple and Google

The calendar-level timezone *name* is deliberately left unset: `ical-generator` would otherwise also format `DTSTAMP` as floating local time, but RFC 5545 requires `DTSTAMP` in UTC.

```typescript
if (event.timezone) {
  cal.timezone({ name: null, generator: getVtimezoneComponent });
  cal.x("X-WR-TIMEZONE", event.timezone);
}
const inZone = (date: Date) => (event.timezone ? new TZDate(date, event.timezone) : date);
cal.createEvent({ start: inZone(startDate), end: inZone(endDate), timezone: event.timezone, ... });

// Results in output like:
// BEGIN:VTIMEZONE
// TZID:Europe/Zurich
// ...
// END:VTIMEZONE
// DTSTART;TZID=Europe/Zurich:20250801T143000
```

Without `tz`, times are written in UTC (`DTSTART:20250801T123000Z`) and no `VTIMEZONE` component is needed.

### RFC 5545 Requirements

According to [RFC 5545 Section 3.2.19](https://www.rfc-editor.org/rfc/rfc5545#section-3.2.19), when using the `TZID` parameter:

- The value MUST be the text value of a `TZID` property of a `VTIMEZONE` component in the iCalendar object
- An iCalendar parser will look for a matching `VTIMEZONE` component
- Using `TZID` without a corresponding `VTIMEZONE` creates an **invalid** iCalendar file

### Why Not Use Global Timezone IDs?

Global timezone IDs (prefixed with `/`, e.g., `TZID=/Europe/Zurich`) are an alternative approach that doesn't require `VTIMEZONE` components. However, we chose not to use them because:

1. **No standard interpretation** - The iCalendar specification doesn't define how parsers should interpret global IDs
2. **Inconsistent support** - While many parsers treat them as Olson timezone IDs, this behavior is not guaranteed
3. **Testing focus** - As a demo app for testing calendar compatibility, we use the standard approach

This decision is supported by [community consensus on Stack Overflow](https://stackoverflow.com/a/41073444/42941087) that VTIMEZONE components provide the most reliable, RFC-compliant approach.

### Example: Valid vs Invalid Timezone Usage

#### ❌ Invalid (Missing VTIMEZONE)
```icalendar
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;TZID=Europe/Zurich:20250801T143000
DTEND;TZID=Europe/Zurich:20250801T153000
END:VEVENT
END:VCALENDAR
```

#### ✅ Valid (With VTIMEZONE)
```icalendar
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VTIMEZONE
TZID:Europe/Zurich
... (timezone rules) ...
END:VTIMEZONE
BEGIN:VEVENT
DTSTART;TZID=Europe/Zurich:20250801T143000
DTEND;TZID=Europe/Zurich:20250801T153000
END:VEVENT
END:VCALENDAR
```

### Client Behavior Notes

- **Without VTIMEZONE**: Calendar clients may fail to parse the file, ignore the timezone, or display incorrect times
- **With VTIMEZONE**: All RFC-compliant clients correctly interpret the event times in the specified timezone
- **UTC Alternative**: For simple cases, using UTC times (with 'Z' suffix) avoids timezone complexity entirely

## Vendor Extensions

To address real-world calendar client limitations, we include several vendor-specific properties that enhance compatibility while maintaining RFC compliance.

### Microsoft Outlook Extensions

#### `X-MICROSOFT-CDO-BUSYSTATUS`

**Purpose**: Controls how events appear in Outlook's free/busy view and scheduling assistant.

**Implementation**:
```typescript
// For cancelled events
event.x("X-MICROSOFT-CDO-BUSYSTATUS", "FREE");

// For confirmed events  
event.x("X-MICROSOFT-CDO-BUSYSTATUS", "BUSY");
```

**Rationale**: Outlook may not properly interpret cancelled events without explicit busy status. Setting cancelled events to "FREE" ensures they don't block time in scheduling and prevents conflicts with cancelled events.

### Apple Calendar Extensions

#### `X-APPLE-TRAVEL-ADVISORY-BEHAVIOR`

**Purpose**: Example of an Apple-only `X-` property. It is Apple Calendar's travel-time advisory setting (`AUTOMATIC` lets Calendar compute travel time to the event location); it is **not** documented to affect cancellation handling.

**Implementation**:
```typescript
// For cancelled events only
if (options.isCancelled) {
  event.x("X-APPLE-TRAVEL-ADVISORY-BEHAVIOR", "AUTOMATIC");
}
```

**Rationale**: Kept from the original implementation as a way to observe whether Apple Calendar accepts and preserves vendor properties on cancelled events. Any effect on cancellation sync is speculative; verify or remove.

### Refresh Interval Hints

#### `REFRESH-INTERVAL` and `X-PUBLISHED-TTL`

**Purpose**: Suggest a refresh rate to subscribing clients.

**Implementation**:
```typescript
// Calendar-level, emitted as REFRESH-INTERVAL;VALUE=DURATION:PT1H and X-PUBLISHED-TTL:PT1H
ical({ ..., ttl: 60 * 60 });
```

**Rationale**: `REFRESH-INTERVAL` is the standard property ([RFC 7986](https://www.rfc-editor.org/rfc/rfc7986#section-5.7)); `X-PUBLISHED-TTL` is the older de-facto hint that Outlook honours. Google Calendar has slow refresh rates (~24 hours) for subscribed calendars and is reported to ignore both; they are included to document intent and to test client behaviour. (An earlier revision emitted a made-up `X-GOOGLE-REFRESH-INTERVAL` property, which no client is known to read.)

### Calendar Client Refresh Rate Comparison

| Client | Default Refresh Rate | User Configurable | Respects X-Properties |
|--------|---------------------|-------------------|----------------------|
| **Apple Calendar** | 5 min - 1 week | ✅ Yes | ✅ Partially |
| **Google Calendar** | ~24 hours | ❌ No | ❌ No |
| **Outlook Desktop** | ~3 hours | ⚠️ Limited | ✅ Yes |
| **Outlook.com** | 3-24 hours | ❌ No | ✅ Partially |
| **Thunderbird** | Manual/configurable | ✅ Yes | ✅ Yes |

## Testing

### Manual Testing Checklist

1. **Basic Event Creation**
   - [ ] Generate feed URL with form
   - [ ] Download .ics file
   - [ ] Import into calendar client
   - [ ] Verify event appears with correct details

2. **Subscription Testing**
   - [ ] Add feed URL as calendar subscription
   - [ ] Verify initial event appears
   - [ ] Modify the duration (same title and startAt, so the UID stays the same; note that `SEQUENCE` stays 0)
   - [ ] Wait for/trigger refresh
   - [ ] Verify whether the client picks up the change

3. **Cancellation Testing**
   - [ ] Create event without cancelAt
   - [ ] Subscribe in calendar client
   - [ ] Add cancelAt in the past
   - [ ] Wait for/trigger refresh
   - [ ] Verify event is cancelled/removed
   - [ ] Repeat with a different title and `cancelMethod=CANCEL` ("Cancellation method" on the demo page)
   - [ ] Compare how the client handles `METHOD:PUBLISH` + `STATUS:CANCELLED` and `METHOD:CANCEL`

### Automated Tests

- **E2E Tests** (`packages/e2e-tests/features/ical*.feature`, Playwright-BDD): demo form functionality, API responses, error handling, timezone and cancellation output
- **Unit Tests** (`packages/app/src/utils/ical-helpers.test.ts`, `node:test`): parameter parsing and validation, UID generation, cancellation state with both cancellation methods
- **Validation**: basic RFC 5545 checks in the E2E tests using [ical.js](https://github.com/kewisch/ical.js) (required properties, `STATUS` values, `TZID` ↔ `VTIMEZONE` consistency)

## Error Handling

Invalid parameters return `400 Bad Request` with a plain text error message, for example:

```
Missing required parameter: title
Invalid duration: must be a whole number of minutes between 1 and 527040
Invalid startAt: must be an ISO 8601 datetime with timezone offset or Z (e.g. 2025-08-01T14:30:00Z)
Invalid tz: must be an IANA timezone identifier with VTIMEZONE data (e.g. Europe/Zurich)
Invalid cancelMethod: must be PUBLISH or CANCEL
```

Repeated query parameters (`title=a&title=b`) are ignored, which results in a "missing parameter" error.

## Security Considerations

- All parameters are validated; the only free-text parameter (`title`) is escaped by `ical-generator` in the output and never reaches a response header
- No server-side state is maintained
- UIDs are a truncated SHA-256 hash of the title and start instant (stable identifier, not a secret)
- No sensitive data is exposed in feeds

## Future Enhancements

This minimal implementation can be extended with:
- Multiple events per feed
- Recurring events (RRULE)
- Attendee management (ATTENDEE)
- Reminder/alarm support (VALARM)
- File attachments (ATTACH)
- Free/busy information