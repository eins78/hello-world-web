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
| `tz` | string | No | Timezone (defaults to UTC) | `Europe/Zurich` |
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

#### Google Calendar
- Slow refresh rate (~24 hours) for subscribed calendars
- Ignores .ics attachments unless sender matches organizer email
- May silently ignore invalid feeds

#### Apple Calendar
- Displays cancelled events with strikethrough
- Supports configurable refresh intervals (5 minutes to 1 week)
- Handles VTIMEZONE data well

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