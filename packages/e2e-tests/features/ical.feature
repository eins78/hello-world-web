Feature: iCalendar Feed
  As a user
  I want to generate iCalendar feeds
  So that I can test calendar client compatibility

  Background:
    Given I am on the iCalendar demo page

  Scenario: Generate basic event feed
    When I fill in the event form with:
      | field    | value         |
      | title    | Team Meeting  |
      | duration | 90            |
    And I click "Generate Feed URL"
    Then I should see a feed URL
    And I should see a download link
    And I should see a subscribe link

  Scenario: Form validation for required fields
    When I clear the "title" field
    And I click "Generate Feed URL"
    Then the form should not submit
    And I should see a validation error

  Scenario: Timezone selection
    When I fill in the event form with:
      | field    | value          |
      | title    | Global Meeting |
      | duration | 60             |
    And I select "Europe/Zurich" from the timezone dropdown
    And I click "Generate Feed URL"
    Then the feed URL should contain "tz=Europe%2FZurich"

  Scenario: Event cancellation
    When I fill in the event form with:
      | field    | value                  |
      | title    | Cancelled Meeting      |
      | duration | 30                     |
    And I set the cancelAt date to yesterday
    And I click "Generate Feed URL"
    Then the feed URL should contain "cancelAt="

  Scenario: Copy feed URL to clipboard
    When I fill in the event form with:
      | field    | value       |
      | title    | Copy Test   |
      | duration | 60          |
    And I click "Generate Feed URL"
    And I click the "Copy" button
    Then the button should show "Copied!"
    And the button should revert to "Copy" after 2 seconds

  Scenario: Download iCalendar file
    When I fill in the event form with:
      | field    | value          |
      | title    | Download Test  |
      | duration | 45             |
    And I click "Generate Feed URL"
    And I click the download link
    Then an .ics file should be downloaded

  Scenario: Subscribe with webcal protocol
    When I fill in the event form with:
      | field    | value            |
      | title    | Subscribe Test   |
      | duration | 60               |
    And I click "Generate Feed URL"
    Then the subscribe link should use "webcal://" protocol