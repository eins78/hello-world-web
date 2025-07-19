Feature: Homepage
  As a user
  I want to visit the homepage
  So that I can see the welcome message and server configuration

  Background:
    Given I navigate to the homepage

  Scenario: Homepage displays welcome message
    Then I should see "Hello World!" as the page title

  Scenario: Server config details are initially closed
    Then the server config details should be collapsed

  Scenario: Server config can be expanded
    When I click on the server config summary
    Then the server config details should be expanded

  Scenario: Server config displays valid JSON data
    When I click on the server config summary
    Then I should see server config JSON with the following properties:
      | property     | type     | value |
      | basePath     | string   | /     |
      | startupTime  | ISO date |       |
      | version      | semver   |       |