Feature: iCalendar API
  As a calendar client
  I want to receive valid iCalendar data
  So that I can properly display events

  Scenario: Valid iCalendar response
    When I request the iCal API with parameters:
      | parameter | value                    |
      | title     | API Test Event           |
      | startAt   | 2025-08-01T14:30:00Z     |
      | duration  | 60                       |
    Then I should receive a 200 response
    And the Content-Type should be "text/calendar; charset=utf-8"
    And the response should contain "BEGIN:VCALENDAR"
    And the response should contain "BEGIN:VEVENT"
    And the response should contain "SUMMARY:API Test Event"

  Scenario: Error handling for missing title
    When I request the iCal API with parameters:
      | parameter | value                    |
      | startAt   | 2025-08-01T14:30:00Z     |
      | duration  | 60                       |
    Then I should receive a 400 response
    And the response should contain "Missing required parameter: title"

  Scenario: Error handling for invalid duration
    When I request the iCal API with parameters:
      | parameter | value                    |
      | title     | Invalid Duration Test    |
      | startAt   | 2025-08-01T14:30:00Z     |
      | duration  | invalid                  |
    Then I should receive a 400 response
    And the response should contain "Invalid duration"

  Scenario: Cancelled event response
    When I request the iCal API with parameters:
      | parameter | value                    |
      | title     | Cancelled Event          |
      | startAt   | 2025-08-01T14:30:00Z     |
      | duration  | 60                       |
      | cancelAt  | 2025-01-01T00:00:00Z     |
    Then I should receive a 200 response
    And the response should contain "METHOD:CANCEL"
    And the response should contain "STATUS:CANCELLED"
    And the response should contain "SEQUENCE:1"

  Scenario: Event with timezone
    When I request the iCal API with parameters:
      | parameter | value                    |
      | title     | Timezone Event           |
      | startAt   | 2025-08-01T14:30:00      |
      | duration  | 90                       |
      | tz        | Europe/Zurich            |
    Then I should receive a 200 response
    And the response should contain "BEGIN:VTIMEZONE"
    And the response should contain "TZID:Europe/Zurich"

  Scenario: RFC 5545 compliance
    When I request the iCal API with parameters:
      | parameter | value                    |
      | title     | RFC Test Event           |
      | startAt   | 2025-08-01T14:30:00Z     |
      | duration  | 60                       |
    Then the iCalendar data should be RFC 5545 compliant
    And the calendar should have version "2.0"
    And the calendar should have a PRODID property
    And the event should have a consistent UID

  Scenario: Vendor extensions for confirmed event
    When I request the iCal API with parameters:
      | parameter | value                    |
      | title     | Vendor Test Event        |
      | startAt   | 2025-08-01T14:30:00Z     |
      | duration  | 60                       |
    Then the event should have vendor extension "x-microsoft-cdo-busystatus" with value "BUSY"
    And the event should have vendor extension "x-google-refresh-interval" with value "PT1H"

  Scenario: Vendor extensions for cancelled event
    When I request the iCal API with parameters:
      | parameter | value                    |
      | title     | Cancelled Vendor Event   |
      | startAt   | 2025-08-01T14:30:00Z     |
      | duration  | 60                       |
      | cancelAt  | 2025-01-01T00:00:00Z     |
    Then the event should have vendor extension "x-microsoft-cdo-busystatus" with value "FREE"
    And the event should have vendor extension "x-apple-travel-advisory-behavior" with value "AUTOMATIC"