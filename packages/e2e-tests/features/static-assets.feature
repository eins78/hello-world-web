Feature: Long-lived caching of styles and scripts
  As a returning visitor
  I want styles and scripts kept in my browser between visits
  So that pages load without downloading them again

  Scenario: Keeping the stylesheet between visits
    Given I am on the homepage
    Then the stylesheet should be kept for a year

  Scenario: Keeping the demo script between visits
    Given I am on the Lit SSR demo page
    Then the demo script should be kept for a year
