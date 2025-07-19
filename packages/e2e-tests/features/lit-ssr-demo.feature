Feature: Server-side rendered Lit components
  As a developer
  I want to verify that Lit components render correctly on the server and hydrate on the client
  So that I can ensure the SSR functionality works properly

  Background:
    Given I am on the Lit SSR demo page

  Scenario: Demo page loads successfully
    Then the page title should be "lit-ssr-demo"

  # Simple Counter Component
  
  Scenario: Simple counter renders with initial value
    Then the simple counter should show "0"

  Scenario: Simple counter preserves server-rendered state
    Then the simple counter should have a "count" attribute set to "0"

  Scenario: Simple counter responds to user interaction
    Given the simple counter shows "0"
    When the component finishes hydrating
    And I click the increment button on the simple counter
    Then the simple counter should show "1"

  # Epoch Counter Component
  
  Scenario: Epoch counter renders with timestamp
    Then the epoch counter should show a timestamp greater than "1"

  Scenario: Epoch counter has no pre-rendered state
    Then the epoch counter should not have an "initial-count" attribute

  Scenario: Epoch counter increments on interaction
    Given I note the current epoch counter value
    When the component finishes hydrating
    And I click the increment button on the epoch counter
    Then the epoch counter value should increase by one