/**
 * Unit tests for iCalendar helper functions
 * 
 * These tests can be run with Node.js built-in test runner:
 * node --test src/utils/ical-helpers.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseEventParams } from './ical-helpers.ts';

describe('parseEventParams', () => {
  describe('validation', () => {
    it('should return error for missing title', () => {
      const result = parseEventParams({
        startAt: '2025-08-01T14:30:00Z',
        duration: '60'
      });
      assert.ok('error' in result);
      assert.equal(result.error, 'Missing required parameter: title');
    });

    it('should return error for missing startAt', () => {
      const result = parseEventParams({
        title: 'Test Event',
        duration: '60'
      });
      assert.ok('error' in result);
      assert.equal(result.error, 'Missing required parameter: startAt');
    });

    it('should return error for missing duration', () => {
      const result = parseEventParams({
        title: 'Test Event',
        startAt: '2025-08-01T14:30:00Z'
      });
      assert.ok('error' in result);
      assert.equal(result.error, 'Missing required parameter: duration');
    });

    it('should return error for invalid duration', () => {
      const result = parseEventParams({
        title: 'Test Event',
        startAt: '2025-08-01T14:30:00Z',
        duration: 'invalid'
      });
      assert.ok('error' in result);
      assert.equal(result.error, 'Invalid duration: must be a positive number');
    });

    it('should return error for negative duration', () => {
      const result = parseEventParams({
        title: 'Test Event',
        startAt: '2025-08-01T14:30:00Z',
        duration: '-30'
      });
      assert.ok('error' in result);
      assert.equal(result.error, 'Invalid duration: must be a positive number');
    });

    it('should return error for invalid startAt date', () => {
      const result = parseEventParams({
        title: 'Test Event',
        startAt: 'invalid-date',
        duration: '60'
      });
      assert.ok('error' in result);
      assert.equal(result.error, 'Invalid startAt: must be a valid ISO 8601 datetime');
    });

    it('should return error for invalid cancelAt date', () => {
      const result = parseEventParams({
        title: 'Test Event',
        startAt: '2025-08-01T14:30:00Z',
        duration: '60',
        cancelAt: 'invalid-date'
      });
      assert.ok('error' in result);
      assert.equal(result.error, 'Invalid cancelAt: must be a valid ISO 8601 datetime');
    });
  });

  describe('successful parsing', () => {
    it('should parse basic event parameters', () => {
      const result = parseEventParams({
        title: 'Test Event',
        startAt: '2025-08-01T14:30:00Z',
        duration: '90'
      });

      assert.ok(!('error' in result));
      assert.equal(result.title, 'Test Event');
      assert.equal(result.duration, 90);
      assert.equal(result.startDate.toISOString(), '2025-08-01T14:30:00.000Z');
      assert.equal(result.endDate.toISOString(), '2025-08-01T16:00:00.000Z');
      assert.ok(result.uid.includes('@hello-world-web.local'));
      assert.equal(result.icalOptions.method, 'PUBLISH');
      assert.equal(result.icalOptions.status, 'CONFIRMED');
      assert.equal(result.icalOptions.sequence, 0);
      assert.equal(result.icalOptions.isCancelled, false);
    });

    it('should parse event with timezone', () => {
      const result = parseEventParams({
        title: 'Test Event',
        startAt: '2025-08-01T14:30:00',
        duration: '60',
        tz: 'Europe/Zurich'
      });

      assert.ok(!('error' in result));
      assert.equal(result.timezone, 'Europe/Zurich');
    });

    it('should handle future cancelAt (not cancelled)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const result = parseEventParams({
        title: 'Test Event',
        startAt: '2025-08-01T14:30:00Z',
        duration: '60',
        cancelAt: futureDate.toISOString()
      });

      assert.ok(!('error' in result));
      assert.equal(result.icalOptions.method, 'PUBLISH');
      assert.equal(result.icalOptions.status, 'CONFIRMED');
      assert.equal(result.icalOptions.sequence, 0);
      assert.equal(result.icalOptions.isCancelled, false);
    });

    it('should handle past cancelAt (cancelled)', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const result = parseEventParams({
        title: 'Test Event',
        startAt: '2025-08-01T14:30:00Z',
        duration: '60',
        cancelAt: pastDate.toISOString()
      });

      assert.ok(!('error' in result));
      assert.equal(result.icalOptions.method, 'CANCEL');
      assert.equal(result.icalOptions.status, 'CANCELLED');
      assert.equal(result.icalOptions.sequence, 1);
      assert.equal(result.icalOptions.isCancelled, true);
    });

    it('should generate consistent UID for same event', () => {
      const params = {
        title: 'Test Event',
        startAt: '2025-08-01T14:30:00Z',
        duration: '60'
      };

      const result1 = parseEventParams(params);
      const result2 = parseEventParams(params);

      assert.ok(!('error' in result1));
      assert.ok(!('error' in result2));
      assert.equal(result1.uid, result2.uid);
    });

    it('should generate different UIDs for different events', () => {
      const result1 = parseEventParams({
        title: 'Event 1',
        startAt: '2025-08-01T14:30:00Z',
        duration: '60'
      });

      const result2 = parseEventParams({
        title: 'Event 2',
        startAt: '2025-08-01T14:30:00Z',
        duration: '60'
      });

      assert.ok(!('error' in result1));
      assert.ok(!('error' in result2));
      assert.notEqual(result1.uid, result2.uid);
    });
  });
});