/**
 * Unit tests for iCalendar helper functions
 *
 * These tests can be run with Node.js built-in test runner:
 * node --test src/utils/ical-helpers.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { parseEventParams, createEventCalendar, pickQueryStrings } from "./ical-helpers.ts";
import type { ParsedEvent } from "../types/events.ts";

const validParams = {
  title: "Test Event",
  startAt: "2025-08-01T14:30:00Z",
  duration: "60",
};

function parseValid(
  overrides: Partial<typeof validParams & { tz: string; cancelAt: string; cancelMethod: string }> = {},
): ParsedEvent {
  const result = parseEventParams({ ...validParams, ...overrides });
  assert.ok(!("error" in result), `expected success, got: ${"error" in result ? result.error : ""}`);
  return result;
}

function parseError(params: Parameters<typeof parseEventParams>[0]): string {
  const result = parseEventParams(params);
  assert.ok("error" in result, "expected an error");
  return result.error;
}

describe("pickQueryStrings", () => {
  it("should keep string values and drop repeated or nested parameters", () => {
    const query = pickQueryStrings({ title: "A", startAt: ["x", "y"], duration: { nested: "1" }, other: "ignored" });
    assert.deepEqual(query, {
      title: "A",
      startAt: undefined,
      duration: undefined,
      tz: undefined,
      cancelAt: undefined,
      cancelMethod: undefined,
    });
  });
});

describe("parseEventParams", () => {
  describe("validation", () => {
    it("should return error for missing title", () => {
      assert.equal(parseError({ startAt: validParams.startAt, duration: "60" }), "Missing required parameter: title");
    });

    it("should return error for missing startAt", () => {
      assert.equal(parseError({ title: "Test Event", duration: "60" }), "Missing required parameter: startAt");
    });

    it("should return error for missing duration", () => {
      assert.equal(
        parseError({ title: "Test Event", startAt: validParams.startAt }),
        "Missing required parameter: duration",
      );
    });

    it("should return error for non-numeric, negative, fractional, exponent, hex and huge durations", () => {
      for (const duration of ["invalid", "-30", "0", "60.5", "1e3", "0x10", "99999999999999"]) {
        assert.match(parseError({ ...validParams, duration }), /^Invalid duration: must be a whole number of minutes/);
      }
    });

    it("should accept the maximum duration of one year", () => {
      assert.equal(parseValid({ duration: "527040" }).duration, 527040);
    });

    it("should return error for startAt that is not ISO 8601 with an offset", () => {
      for (const startAt of [
        "invalid-date",
        "2025-08-01T14:30:00",
        "2025-08-01",
        "Aug 1 2025",
        "1",
        "2025-13-01T00:00:00Z",
      ]) {
        assert.match(parseError({ ...validParams, startAt }), /^Invalid startAt: must be an ISO 8601 datetime/);
      }
    });

    it("should return error for cancelAt without an offset", () => {
      assert.match(parseError({ ...validParams, cancelAt: "2025-08-01T14:30:00" }), /^Invalid cancelAt/);
    });

    it("should return error for an unknown cancelMethod", () => {
      for (const cancelMethod of ["cancel", "REQUEST", "DELETE"]) {
        assert.equal(parseError({ ...validParams, cancelMethod }), "Invalid cancelMethod: must be PUBLISH or CANCEL");
      }
    });

    it("should return error for unknown timezones and aliases without VTIMEZONE data", () => {
      for (const tz of ["Nope/Nope", "europe/zurich", "Asia/Calcutta", "EST"]) {
        assert.match(parseError({ ...validParams, tz }), /^Invalid tz: must be an IANA timezone identifier/);
      }
    });
  });

  describe("successful parsing", () => {
    it("should parse basic event parameters", () => {
      const result = parseValid({ duration: "90" });

      assert.equal(result.title, "Test Event");
      assert.equal(result.duration, 90);
      assert.equal(result.startDate.toISOString(), "2025-08-01T14:30:00.000Z");
      assert.equal(result.endDate.toISOString(), "2025-08-01T16:00:00.000Z");
      assert.ok(result.uid.includes("@hello-world-web.local"));
      assert.equal(result.timezone, undefined);
      assert.equal(result.icalOptions.method, "PUBLISH");
      assert.equal(result.icalOptions.status, "CONFIRMED");
      assert.equal(result.icalOptions.sequence, 0);
      assert.equal(result.icalOptions.isCancelled, false);
    });

    it("should accept a startAt with an explicit UTC offset", () => {
      assert.equal(
        parseValid({ startAt: "2025-08-01T16:30:00+02:00" }).startDate.toISOString(),
        "2025-08-01T14:30:00.000Z",
      );
    });

    it("should parse event with timezone", () => {
      assert.equal(parseValid({ tz: "Europe/Zurich" }).timezone, "Europe/Zurich");
    });

    it("should treat empty tz and UTC as no timezone", () => {
      for (const tz of ["", "UTC", "Etc/UTC"]) {
        assert.equal(parseValid({ tz }).timezone, undefined);
      }
    });

    it("should handle future cancelAt (not cancelled)", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const result = parseValid({ cancelAt: futureDate.toISOString() });
      assert.equal(result.icalOptions.method, "PUBLISH");
      assert.equal(result.icalOptions.status, "CONFIRMED");
      assert.equal(result.icalOptions.sequence, 0);
      assert.equal(result.icalOptions.isCancelled, false);
    });

    it("should handle past cancelAt (cancelled)", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const result = parseValid({ cancelAt: pastDate.toISOString() });
      assert.equal(result.icalOptions.method, "PUBLISH");
      assert.equal(result.icalOptions.status, "CANCELLED");
      assert.equal(result.icalOptions.sequence, 1);
      assert.equal(result.icalOptions.isCancelled, true);
    });

    it("should use METHOD:CANCEL for a cancelled event when cancelMethod=CANCEL", () => {
      const result = parseValid({ cancelAt: "2025-01-01T00:00:00Z", cancelMethod: "CANCEL" });
      assert.equal(result.icalOptions.method, "CANCEL");
      assert.equal(result.icalOptions.status, "CANCELLED");
      assert.equal(result.icalOptions.sequence, 1);
    });

    it("should accept an explicit cancelMethod=PUBLISH", () => {
      const result = parseValid({ cancelAt: "2025-01-01T00:00:00Z", cancelMethod: "PUBLISH" });
      assert.equal(result.icalOptions.method, "PUBLISH");
      assert.equal(result.icalOptions.status, "CANCELLED");
    });

    it("should ignore cancelMethod=CANCEL while the event is not cancelled", () => {
      for (const overrides of [{}, { cancelAt: "2999-01-01T00:00:00Z" }]) {
        const result = parseValid({ ...overrides, cancelMethod: "CANCEL" });
        assert.equal(result.icalOptions.method, "PUBLISH");
        assert.equal(result.icalOptions.status, "CONFIRMED");
      }
    });

    it("should generate the same UID for the same instant regardless of spelling", () => {
      const uids = ["2025-08-01T14:30:00Z", "2025-08-01T14:30:00.000Z", "2025-08-01T16:30:00+02:00"].map(
        (startAt) => parseValid({ startAt }).uid,
      );
      assert.equal(new Set(uids).size, 1);
    });

    it("should generate different UIDs for different events", () => {
      assert.notEqual(parseValid({ title: "Event 1" }).uid, parseValid({ title: "Event 2" }).uid);
      assert.notEqual(parseValid().uid, parseValid({ startAt: "2025-08-02T14:30:00Z" }).uid);
    });
  });
});

describe("createEventCalendar", () => {
  const lines = (event: ParsedEvent) => createEventCalendar(event).toString().split("\r\n");

  it("should write UTC times with a Z suffix and no VTIMEZONE when no timezone is given", () => {
    const output = lines(parseValid());
    assert.ok(output.includes("DTSTART:20250801T143000Z"));
    assert.ok(output.includes("DTEND:20250801T153000Z"));
    assert.ok(!output.includes("BEGIN:VTIMEZONE"));
    assert.ok(output.includes("METHOD:PUBLISH"));
    assert.ok(output.includes("STATUS:CONFIRMED"));
  });

  it("should write wall-clock times of the requested timezone with TZID and a matching VTIMEZONE", () => {
    // Independent of the process timezone (the test script runs with TZ=Pacific/Auckland)
    const output = lines(parseValid({ tz: "Europe/Zurich" }));
    assert.ok(output.includes("BEGIN:VTIMEZONE"));
    assert.ok(output.includes("TZID:Europe/Zurich"));
    assert.ok(output.includes("DTSTART;TZID=Europe/Zurich:20250801T163000"));
    assert.ok(output.includes("DTEND;TZID=Europe/Zurich:20250801T173000"));
    assert.ok(output.includes("X-WR-TIMEZONE:Europe/Zurich"));
    assert.ok(
      output.some((line) => /^DTSTAMP:\d{8}T\d{6}Z$/.test(line)),
      "DTSTAMP must be in UTC",
    );
  });

  it("should include refresh hints and vendor extensions", () => {
    const output = lines(parseValid());
    assert.ok(output.includes("REFRESH-INTERVAL;VALUE=DURATION:PT1H"));
    assert.ok(output.includes("X-PUBLISHED-TTL:PT1H"));
    assert.ok(output.includes("X-MICROSOFT-CDO-BUSYSTATUS:BUSY"));
    assert.ok(!output.some((line) => line.startsWith("X-APPLE-TRAVEL-ADVISORY-BEHAVIOR")));
  });

  it("should mark cancelled events", () => {
    const output = lines(parseValid({ cancelAt: "2025-01-01T00:00:00Z" }));
    assert.ok(output.includes("METHOD:PUBLISH"));
    assert.ok(output.includes("STATUS:CANCELLED"));
    assert.ok(output.includes("SEQUENCE:1"));
    assert.ok(output.includes("X-MICROSOFT-CDO-BUSYSTATUS:FREE"));
    assert.ok(output.includes("X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC"));
  });

  it("should mark cancelled events with METHOD:CANCEL when requested", () => {
    const output = lines(parseValid({ cancelAt: "2025-01-01T00:00:00Z", cancelMethod: "CANCEL" }));
    assert.ok(output.includes("METHOD:CANCEL"));
    assert.ok(!output.includes("METHOD:PUBLISH"));
    assert.ok(output.includes("STATUS:CANCELLED"));
    assert.ok(output.includes("SEQUENCE:1"));
  });
});
