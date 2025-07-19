# Gherkin Best Practices and Style Guide

## Overview
This document outlines the best practices for writing Gherkin scenarios based on Cucumber's official reference guide. These rules ensure our BDD specifications are idiomatic, readable, and maintainable.

## Core Principles

### 1. Business Language Over Technical Language
- Write scenarios as if it were 1922 before computers existed
- Focus on **what** the system does, not **how** it does it
- Use language that business stakeholders can understand

### 2. Scenario Structure
- Follow the Given-When-Then pattern strictly
- Aim for 3-5 steps per scenario
- Keep scenarios focused on a single behavior or outcome

## Step Keywords

### Given
- Describes the initial context or preconditions
- Sets up the world/state before the action
- Example: `Given I am on the homepage`

### When
- Describes the action or event that triggers the behavior
- Should be a single, clear action
- Example: `When I click the submit button`

### Then
- Describes the expected outcome or result
- Should be observable by the user
- Example: `Then I should see a success message`

### And/But
- Use to improve readability when you have multiple steps of the same type
- `And` continues the previous step type
- `But` is used for negative assertions
- Example: 
  ```gherkin
  Given I am logged in
  And I have items in my cart
  When I go to checkout
  Then I should see my order summary
  But I should not see expired items
  ```

## Background Best Practices
- Use for common setup steps across all scenarios in a feature
- Keep backgrounds short and focused
- Avoid complex state setup in backgrounds
- Example:
  ```gherkin
  Background:
    Given I am on the application homepage
  ```

## Writing Style Guidelines

### 1. Use Active Voice
- ✅ Good: `When I click the button`
- ❌ Bad: `When the button is clicked`

### 2. Be Specific but Not Technical
- ✅ Good: `Then I should see "Welcome back, John"`
- ❌ Bad: `Then the div with class .welcome should contain text`

### 3. Avoid Implementation Details
- ✅ Good: `When I search for "cucumber"`
- ❌ Bad: `When I send a GET request to /api/search?q=cucumber`

### 4. Use Consistent Terminology
- Pick one term and stick with it (e.g., "click" vs "select" vs "press")
- Define a project glossary if needed

## Common Anti-Patterns to Avoid

### 1. Overly Complex Scenarios
- If a scenario has more than 5-7 steps, consider breaking it down
- Each scenario should test one thing

### 2. Technical Implementation Language
- Avoid mentioning databases, APIs, CSS classes, etc.
- Focus on user-visible behavior

### 3. Redundant Steps
- Don't repeat the same information in multiple ways
- Each step should add value

### 4. Mixing Levels of Abstraction
- Keep all steps at the same level of detail
- Don't mix high-level business steps with low-level UI steps

## Data Tables
Use data tables for structured input:
```gherkin
Then I should see configuration data containing:
  | property     | type     | value |
  | basePath     | string   | /     |
  | startupTime  | ISO date |       |
```

## Scenario Outlines
Use for data-driven tests:
```gherkin
Scenario Outline: User login with different credentials
  Given I am on the login page
  When I log in as "<username>" with password "<password>"
  Then I should see "<message>"

  Examples:
    | username | password | message        |
    | alice    | pass123  | Welcome, Alice |
    | bob      | secret   | Welcome, Bob   |
```

## Tags
Use tags sparingly and meaningfully:
- `@smoke` - for smoke tests
- `@wip` - for work in progress
- `@slow` - for tests that take a long time

## File Organization
- One feature per file
- Feature files should be named after the feature they test
- Group related scenarios within a feature
- Use comments sparingly - scenarios should be self-documenting