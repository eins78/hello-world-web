Feature: Lit SSR Demo
  As a user
  I want to interact with the Lit SSR demo
  So that I can test server-side rendering and client-side hydration

  Background:
    Given I navigate to the Lit SSR demo page

  Scenario: Lit SSR demo page displays title
    Then I should see "lit-ssr-demo" as the page title

  # Simple Counter Component Tests
  Scenario: Simple counter displays initial count
    Then the simple counter should display count "0"

  Scenario: Simple counter has server-rendered markup
    Then the simple counter element should have attribute "count" with value "0"

  Scenario: Simple counter increments when button is clicked
    Given the simple counter displays count "0"
    When I wait for the simple counter to be hydrated
    And I click the simple counter increment button
    Then the simple counter should display count "1"

  # Epoch Counter Component Tests  
  Scenario: Epoch counter displays a valid timestamp
    Then the epoch counter should display a timestamp greater than "1"

  Scenario: Epoch counter has no initial-count attribute
    Then the epoch counter element should not have attribute "initial-count"

  Scenario: Epoch counter increments when button is clicked
    Given I note the current epoch counter value
    When I wait for the epoch counter to be hydrated
    And I click the epoch counter increment button
    Then the epoch counter should display an incremented value