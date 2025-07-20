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
| `startAt` | string | Yes | ISO 8601 datetime | `2025-08-01T14:30:00` |
| `duration` | number | Yes | Duration in minutes | `90` |
| `tz` | string | No | Timezone identifier (defaults to UTC). When specified, generates a VTIMEZONE component in the output. | `Europe/Zurich` |
| `cancelAt` | string | No | ISO datetime when event becomes cancelled | `2025-07-31T12:00:00` |

#### Response

- **Content-Type**: `text/calendar; charset=utf-8`
- **Body**: Valid iCalendar data

#### Example Request

```
GET /api/ical/events.ics?title=Team%20Meeting&startAt=2025-08-01T14:30:00&duration=60&tz=Europe/Zurich
```

#### Example Response

```icalendar
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hello World Web//Event Feed//EN
METHOD:PUBLISH
BEGIN:VTIMEZONE
TZID:Europe/Zurich
...
END:VTIMEZONE
BEGIN:VEVENT
UID:a1b2c3d4@hello-world-web.local
DTSTAMP:20250119T120000Z
DTSTART;TZID=Europe/Zurich:20250801T143000
DTEND;TZID=Europe/Zurich:20250801T153000
SUMMARY:Team Meeting
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR
```

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

Event UIDs are generated using a hash of the event's stable properties (title + startAt) to ensure consistency across requests. This allows calendar clients to properly track updates to the same event.

```typescript
const uid = `${revHash(title + startAt)}@hello-world-web.local`;
```

### Sequence Handling

- `SEQUENCE: 0` - Initial event (not cancelled)
- `SEQUENCE: 1` - Updated event (cancelled)

The sequence number increments when the event transitions to cancelled state, signaling to clients that this is an update to an existing event.

### Cancellation Logic

If `cancelAt` parameter is provided and the current time is past that timestamp:
- `METHOD: CANCEL` (instead of PUBLISH)
- `STATUS: CANCELLED` (instead of CONFIRMED)
- `SEQUENCE: 1` (incremented)

## Client Compatibility

### Tested Clients

| Client | Version | Subscription | Import | Cancellation | Notes |
|--------|---------|--------------|--------|--------------|-------|
| Apple Calendar | macOS 14+ | ✅ | ✅ | ✅ | Refresh: 5min-1week |
| Google Calendar | Web | ✅ | ❌ | ✅ | Refresh: ~24h |
| Outlook Desktop | 2021+ | ✅ | ✅ | ✅ | Refresh: ~3h |
| Outlook.com | Web | ✅ | ✅ | ✅ | Refresh: 3-24h |
| Thunderbird | 115+ | ✅ | ✅ | ✅ | Manual refresh available |

### Known Vendor Quirks

#### Microsoft Outlook
- Requires proper `METHOD:CANCEL` for cancellations to avoid "not supported calendar message" errors
- May show duplicate events if UID is not consistent
- Uses `X-MICROSOFT-CDO-BUSYSTATUS` for free/busy status in scheduling assistant

#### Google Calendar
- Slow refresh rate (~24 hours) for subscribed calendars
- Ignores .ics attachments unless sender matches organizer email
- May silently ignore invalid feeds
- **Ignores refresh interval hints** - deliberately ignores `X-PUBLISHED-TTL` and `X-GOOGLE-REFRESH-INTERVAL` to prevent server overload

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
- SEQUENCE increment for modifications
- METHOD property for scheduling semantics
- VTIMEZONE components for non-UTC times
- STATUS property for event state

## Timezone Handling

Proper timezone handling is critical for iCalendar feeds to work correctly across different calendar clients and time zones.

### Implementation Approach

When a timezone is specified via the `tz` parameter, our implementation:

1. Sets the timezone at the calendar level using `cal.timezone(timezone)`
2. This automatically generates the required `VTIMEZONE` component
3. Event times are then specified with `TZID` parameters that reference this timezone

```typescript
// Setting timezone on calendar generates VTIMEZONE component
if (event.timezone) {
  cal.timezone(event.timezone);
}

// Results in output like:
// DTSTART;TZID=Europe/Zurich:20250801T143000
```

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

**Purpose**: Enhances cancellation handling reliability in Apple Calendar.

**Implementation**:
```typescript
// For cancelled events only
if (options.isCancelled) {
  event.x("X-APPLE-TRAVEL-ADVISORY-BEHAVIOR", "AUTOMATIC");
}
```

**Rationale**: Apple Calendar has known issues with cancelled event synchronization, particularly with Exchange/Outlook cancellations. This property provides additional hints to improve cancellation processing reliability.

### Google Calendar Extensions

#### `X-GOOGLE-REFRESH-INTERVAL`

**Purpose**: Attempts to influence Google Calendar's subscription refresh rate.

**Implementation**:
```typescript
// Applied to all events
event.x("X-GOOGLE-REFRESH-INTERVAL", "PT1H"); // 1 hour hint
```

**Rationale**: Google Calendar has extremely slow refresh rates (~24 hours) for subscribed calendars. While Google deliberately ignores this property to prevent server overload, it's included for documentation of intent and potential future compatibility.

**Note**: This property is currently **ineffective** but represents standard practice in the calendar ecosystem.

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
   - [ ] Modify parameters (keep same UID)
   - [ ] Wait for/trigger refresh
   - [ ] Verify updates are reflected

3. **Cancellation Testing**
   - [ ] Create event without cancelAt
   - [ ] Subscribe in calendar client
   - [ ] Add cancelAt in the past
   - [ ] Wait for/trigger refresh
   - [ ] Verify event is cancelled/removed

### Automated Tests

- **E2E Tests**: Cypress tests for demo form functionality
- **Unit Tests**: iCal generation with various parameters
- **Validation**: RFC compliance checking

## Error Handling

Invalid parameters return `400 Bad Request` with plain text error message:

```
Missing required parameter: title
```

## Security Considerations

- All user input is validated and sanitized
- No server-side state is maintained
- Generated UIDs use cryptographic hashing
- No sensitive data is exposed in feeds

## Future Enhancements

This minimal implementation can be extended with:
- Multiple events per feed
- Recurring events (RRULE)
- Attendee management (ATTENDEE)
- Reminder/alarm support (VALARM)
- File attachments (ATTACH)
- Free/busy information