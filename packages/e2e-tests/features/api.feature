Feature: Answers for unknown addresses
  As a developer using the API
  I want unknown API addresses to answer in the same format as the API
  So that my client can handle a missing address like any other API response

  Scenario: Asking the API for something it does not offer
    When I ask the API for "/api/does-not-exist"
    Then the answer should be "Not Found"
    And the answer should be JSON with the error "Not Found"

  Scenario: Visiting a page that does not exist
    When I ask for the page "/does-not-exist"
    Then the answer should be "Not Found"
    And the answer should be a web page
