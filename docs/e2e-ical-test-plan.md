# E2E Test Plan: iCalendar Feature

## Overview

This document outlines a comprehensive End-to-End testing strategy for the iCalendar (.ics) feed feature. The tests will validate both the web interface functionality and the generated iCalendar data compliance with RFC 5545 specifications.

## Test Architecture

### Testing Stack

#### 1. **Primary Testing Framework**
- **Playwright-BDD**: For web interface testing (already established in project)
- **Node.js Built-in Test Runner**: For iCalendar parsing/validation tests

#### 2. **iCalendar Client Libraries** (Research Results)

| Library | Use Case | Advantages | Disadvantages |
|---------|----------|------------|---------------|
| **ical.js** ⭐ | RFC validation & parsing | - No dependencies<br>- Mozilla-backed<br>- Recent updates (12 days ago)<br>- 81 dependents | - Requires separate timezone data |
| **node-ical** | Node.js-specific testing | - Async/sync APIs<br>- Filesystem access<br>- JSDoc with IDE hints | - 8 months since update<br>- Uses axios dependency |
| **icalvalid** | RFC 5545 compliance | - Dedicated validator<br>- Based on RFC 5545 | - GitHub project (unknown maintenance) |

**Recommendation**: Use **ical.js** as primary library with **icalvalid** for comprehensive RFC compliance validation.

#### 3. **External Validation Services**
- **iCalendar.org Validator** (https://icalendar.org/validator.html)
- For comprehensive RFC 5545 compliance checking

## Test Categories

### A. Web Interface Tests (Playwright-BDD)

#### A1. Demo Page Functionality
```gherkin
Feature: iCalendar Demo Page
  As a user
  I want to generate iCalendar feeds
  So that I can test calendar client compatibility

  Scenario: Generate basic event feed
    Given I am on the iCalendar demo page
    When I fill in the event form with valid data
    And I click "Generate Feed URL"
    Then I should see a feed URL
    And I should see download and subscribe links

  Scenario: Form validation
    Given I am on the iCalendar demo page
    When I submit the form with missing required fields
    Then I should see validation errors
    And the form should not submit

  Scenario: Timezone selection
    Given I am on the iCalendar demo page
    When I select different timezones
    And I generate a feed URL
    Then the URL should include the timezone parameter

  Scenario: Cancellation functionality
    Given I am on the iCalendar demo page
    When I set a cancelAt date in the past
    And I generate a feed URL
    Then the generated feed should show a cancelled event
```

#### A2. API Response Tests
```gherkin
Feature: iCalendar API Responses
  As a calendar client
  I want to receive valid iCalendar data
  So that I can properly display events

  Scenario: Valid iCalendar response
    When I request "/api/ical/events.ics" with valid parameters
    Then I should receive a 200 response
    And the Content-Type should be "text/calendar; charset=utf-8"
    And the response should contain valid iCalendar data

  Scenario: Error handling
    When I request "/api/ical/events.ics" with missing parameters
    Then I should receive a 400 response
    And the response should contain an error message

  Scenario: Cancelled event response
    When I request an event with cancelAt in the past
    Then the response should contain "METHOD:CANCEL"
    And the response should contain "STATUS:CANCELLED"
```

### B. iCalendar Data Validation Tests (Node.js + ical.js)

#### B1. RFC 5545 Compliance
```typescript
// Test file: packages/e2e-tests/ical-validation.test.ts

describe('iCalendar RFC 5545 Compliance', () => {
  test('generates valid VCALENDAR structure', async () => {
    const response = await fetch('/api/ical/events.ics?title=Test&startAt=2025-08-01T14:30:00Z&duration=60');
    const icalData = await response.text();
    
    const parsed = ICAL.parse(icalData);
    const comp = new ICAL.Component(parsed);
    
    // Validate VCALENDAR properties
    expect(comp.name).toBe('vcalendar');
    expect(comp.getFirstPropertyValue('version')).toBe('2.0');
    expect(comp.getFirstPropertyValue('prodid')).toContain('Hello World Web');
  });

  test('generates proper VEVENT structure', async () => {
    // Test VEVENT properties: UID, DTSTART, DTEND, SUMMARY, etc.
  });

  test('handles timezone data correctly', async () => {
    // Test VTIMEZONE component generation when timezone specified
  });
});
```

#### B2. Vendor Extension Validation
```typescript
describe('Vendor Extensions', () => {
  test('includes Microsoft Outlook extensions', async () => {
    const icalData = await generateTestEvent();
    const parsed = ICAL.parse(icalData);
    
    // Verify X-MICROSOFT-CDO-BUSYSTATUS is present and valid
  });

  test('includes Apple Calendar extensions for cancelled events', async () => {
    const icalData = await generateCancelledEvent();
    
    // Verify X-APPLE-TRAVEL-ADVISORY-BEHAVIOR
  });
});
```

#### B3. Edge Case Testing
```typescript
describe('Edge Cases', () => {
  test('handles very long event titles', async () => {
    const longTitle = 'A'.repeat(1000);
    // Test RFC line length limits
  });

  test('handles special characters in event data', async () => {
    // Test Unicode, newlines, quotes, etc.
  });

  test('handles timezone edge cases', async () => {
    // Test DST transitions, invalid timezones
  });
});
```

### C. Integration Tests

#### C1. Calendar Client Simulation
```typescript
describe('Calendar Client Compatibility', () => {
  test('simulates Apple Calendar subscription', async () => {
    // Use ical.js to parse as Apple Calendar would
    const icalData = await fetchICalFeed();
    const events = parseEvents(icalData);
    
    // Verify event appears correctly
    expect(events).toHaveLength(1);
    expect(events[0].summary).toBe('Expected Title');
  });

  test('simulates Google Calendar import', async () => {
    // Test Google-specific quirks and requirements
  });

  test('simulates Outlook subscription', async () => {
    // Test Microsoft-specific extensions
  });
});
```

#### C2. Cancellation Flow Testing
```typescript
describe('Event Cancellation Flow', () => {
  test('event lifecycle: created -> cancelled', async () => {
    // 1. Create event
    const originalEvent = await generateEvent({ cancelAt: null });
    
    // 2. Cancel event (same UID, updated sequence)
    const cancelledEvent = await generateEvent({ 
      cancelAt: new Date(Date.now() - 86400000).toISOString() 
    });
    
    // 3. Verify cancellation properties
    expect(cancelledEvent).toContain('METHOD:CANCEL');
    expect(cancelledEvent).toContain('SEQUENCE:1');
  });
});
```

### D. Performance & Load Testing

#### D1. Response Time Testing
```typescript
describe('Performance', () => {
  test('generates feed within acceptable time', async () => {
    const start = performance.now();
    await fetch('/api/ical/events.ics?title=Test&startAt=2025-08-01T14:30:00Z&duration=60');
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(500); // 500ms threshold
  });

  test('handles concurrent requests', async () => {
    const requests = Array(10).fill().map(() => 
      fetch('/api/ical/events.ics?title=Test&startAt=2025-08-01T14:30:00Z&duration=60')
    );
    
    const responses = await Promise.all(requests);
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
```

## Implementation Strategy

### Phase 1: Foundation (Week 1)
1. **Setup ical.js dependency** in e2e-tests package
2. **Create basic iCalendar parsing utilities**
3. **Add web interface BDD tests** for demo page
4. **Implement API response validation tests**

### Phase 2: Validation (Week 2)
1. **RFC 5545 compliance tests** using ical.js
2. **Vendor extension validation**
3. **Timezone handling verification**
4. **Error condition testing**

### Phase 3: Integration (Week 3)
1. **Calendar client simulation tests**
2. **Cancellation flow end-to-end testing**
3. **External validator integration** (icalendar.org)
4. **Performance benchmarking**

### Phase 4: Edge Cases & Polish (Week 4)
1. **Edge case scenario testing**
2. **Load testing implementation**
3. **CI/CD integration optimization**
4. **Documentation and reporting**

## File Structure

```
packages/e2e-tests/
├── features/
│   └── ical.feature                    # BDD scenarios
├── steps/
│   └── ical-steps.ts                   # Step definitions
├── pages/
│   └── ical-demo-page.ts               # Page object model
├── utils/
│   ├── ical-parser.ts                  # ical.js wrapper utilities
│   ├── test-data-generator.ts          # Test data generation
│   └── external-validator.ts           # icalendar.org API integration
├── validation/
│   ├── rfc5545-compliance.test.ts      # RFC compliance tests
│   ├── vendor-extensions.test.ts       # Vendor-specific tests
│   └── integration.test.ts             # Client simulation tests
└── performance/
    └── load-testing.test.ts             # Performance benchmarks
```

## Dependencies to Add

```json
{
  "devDependencies": {
    "ical.js": "^2.2.0",
    "node-fetch": "^3.3.2"
  }
}
```

## Success Criteria

### Functional Requirements
- ✅ All web interface interactions work correctly
- ✅ Generated iCalendar data is RFC 5545 compliant
- ✅ Vendor extensions are properly implemented
- ✅ Timezone handling works correctly
- ✅ Cancellation flow operates as expected

### Quality Requirements
- ✅ 95%+ test coverage for iCalendar functionality
- ✅ All tests pass in CI/CD pipeline
- ✅ Response times under 500ms for feed generation
- ✅ External validator confirms RFC compliance

### Maintenance Requirements
- ✅ Tests are maintainable and well-documented
- ✅ Clear failure messages and debugging information
- ✅ Automated reporting of test results

## Risk Mitigation

### Technical Risks
1. **ical.js parsing differences**: Validate against multiple libraries
2. **External validator availability**: Cache validation results, fallback to local validation
3. **Timezone data inconsistencies**: Test with specific known timezones

### Maintenance Risks
1. **RFC specification changes**: Monitor RFC updates, automated compliance checking
2. **Vendor extension evolution**: Regular review of client compatibility
3. **Library deprecation**: Monitor dependency health, have fallback options

## Monitoring & Reporting

### Test Metrics
- Test execution time
- RFC compliance score
- Vendor compatibility matrix
- Performance benchmarks

### Continuous Monitoring
- Daily RFC compliance checks
- Weekly vendor extension validation
- Monthly performance regression testing

## Conclusion

This comprehensive E2E testing strategy ensures the iCalendar feature is robust, RFC-compliant, and compatible with major calendar clients. The phased implementation approach allows for iterative development and early feedback, while the multi-layered testing approach catches issues at different levels of the application stack.