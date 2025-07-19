// Generated from: features/homepage.feature
import { test } from "playwright-bdd";

test.describe('Homepage', () => {

  test.beforeEach('Background', async ({ Given, page }) => {
    await Given('I navigate to the homepage', null, { page }); 
  });
  
  test('Homepage displays welcome message', async ({ Then, page }) => { 
    await Then('I should see "Hello World!" as the page title', null, { page }); 
  });

  test('Server config details are initially closed', async ({ Then, page }) => { 
    await Then('the server config details should be collapsed', null, { page }); 
  });

  test('Server config can be expanded', async ({ When, page, Then }) => { 
    await When('I click on the server config summary', null, { page }); 
    await Then('the server config details should be expanded', null, { page }); 
  });

  test('Server config displays valid JSON data', async ({ When, page, Then }) => { 
    await When('I click on the server config summary', null, { page }); 
    await Then('I should see server config JSON with the following properties:', {"dataTable":{"rows":[{"cells":[{"value":"property"},{"value":"type"},{"value":"value"}]},{"cells":[{"value":"basePath"},{"value":"string"},{"value":"/"}]},{"cells":[{"value":"startupTime"},{"value":"ISO date"},{"value":""}]},{"cells":[{"value":"version"},{"value":"semver"},{"value":""}]}]}}, { page }); 
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use('features/homepage.feature'),
  $bddFileData: ({}, use) => use(bddFileData),
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I navigate to the homepage","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then I should see \"Hello World!\" as the page title","stepMatchArguments":[{"group":{"start":13,"value":"\"Hello World!\"","children":[{"start":14,"value":"Hello World!","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":14,"pickleLine":12,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I navigate to the homepage","isBg":true,"stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then the server config details should be collapsed","stepMatchArguments":[]}]},
  {"pwTestLine":18,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I navigate to the homepage","isBg":true,"stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"When I click on the server config summary","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"Then the server config details should be expanded","stepMatchArguments":[]}]},
  {"pwTestLine":23,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I navigate to the homepage","isBg":true,"stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"When I click on the server config summary","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Then I should see server config JSON with the following properties:","stepMatchArguments":[]}]},
]; // bdd-data-end