Feature: Homepage welcome and server information
  As a visitor to the application
  I want to see a welcome message and view server configuration
  So that I can verify the application is running and check its configuration

  Background:
    Given I am on the homepage

  Scenario: Viewing the welcome message
    Then the page title should be "Hello World!"

  Scenario: Server configuration is initially hidden
    Then the server configuration section should be collapsed

  Scenario: Expanding the server configuration
    When I click on the server configuration toggle
    Then the server configuration section should be expanded

  Scenario: Viewing server configuration details
    When I expand the server configuration section
    Then I should see configuration data containing:
      | property     | type     | value        |
      | basePath     | string   | /            |
      | httpPort     | number   | 9999         |
      | version      | semver   | 2.0.0-rc.1   |