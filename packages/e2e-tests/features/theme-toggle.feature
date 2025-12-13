Feature: Theme Toggle
  As a user
  I want to manually toggle between light and dark themes
  So that I can choose my preferred visual appearance

  Background:
    Given I am on the homepage

  Scenario: Theme toggle is visible on the homepage
    Then the theme toggle should be visible

  Scenario: Default theme is System
    Then the System theme button should be active

  Scenario: Switching to Light theme
    When I click on the Light theme button
    Then the Light theme button should be active
    And the page should use the light theme

  Scenario: Switching to Dark theme
    When I click on the Dark theme button
    Then the Dark theme button should be active
    And the page should use the dark theme

  Scenario: Switching back to System theme
    When I click on the Dark theme button
    And I click on the System theme button
    Then the System theme button should be active
    And the data-theme attribute should be removed

  Scenario: Theme preference persists across page reload
    When I click on the Light theme button
    And I reload the page
    Then the Light theme button should be active
    And the page should use the light theme
