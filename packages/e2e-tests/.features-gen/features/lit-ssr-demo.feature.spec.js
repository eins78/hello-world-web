// Generated from: features/lit-ssr-demo.feature
import { test } from "playwright-bdd";

test.describe('Lit SSR Demo', () => {

  test.beforeEach('Background', async ({ Given, page }) => {
    await Given('I navigate to the Lit SSR demo page', null, { page }); 
  });
  
  test('Lit SSR demo page displays title', async ({ Then, page }) => { 
    await Then('I should see "lit-ssr-demo" as the page title', null, { page }); 
  });

  test('Simple counter displays initial count', async ({ Then, page }) => { 
    await Then('the simple counter should display count "0"', null, { page }); 
  });

  test('Simple counter has server-rendered markup', async ({ Then, page }) => { 
    await Then('the simple counter element should have attribute "count" with value "0"', null, { page }); 
  });

  test('Simple counter increments when button is clicked', async ({ Given, page, When, And, Then }) => { 
    await Given('the simple counter displays count "0"', null, { page }); 
    await When('I wait for the simple counter to be hydrated', null, { page }); 
    await And('I click the simple counter increment button', null, { page }); 
    await Then('the simple counter should display count "1"', null, { page }); 
  });

  test('Epoch counter displays a valid timestamp', async ({ Then, page }) => { 
    await Then('the epoch counter should display a timestamp greater than "1"', null, { page }); 
  });

  test('Epoch counter has no initial-count attribute', async ({ Then, page }) => { 
    await Then('the epoch counter element should not have attribute "initial-count"', null, { page }); 
  });

  test('Epoch counter increments when button is clicked', async ({ Given, page, When, And, Then }) => { 
    await Given('I note the current epoch counter value', null, { page }); 
    await When('I wait for the epoch counter to be hydrated', null, { page }); 
    await And('I click the epoch counter increment button', null, { page }); 
    await Then('the epoch counter should display an incremented value', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use('features/lit-ssr-demo.feature'),
  $bddFileData: ({}, use) => use(bddFileData),
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I navigate to the Lit SSR demo page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then I should see \"lit-ssr-demo\" as the page title","stepMatchArguments":[{"group":{"start":13,"value":"\"lit-ssr-demo\"","children":[{"start":14,"value":"lit-ssr-demo","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":14,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I navigate to the Lit SSR demo page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then the simple counter should display count \"0\"","stepMatchArguments":[{"group":{"start":40,"value":"\"0\"","children":[{"start":41,"value":"0","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":18,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I navigate to the Lit SSR demo page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"Then the simple counter element should have attribute \"count\" with value \"0\"","stepMatchArguments":[{"group":{"start":49,"value":"\"count\"","children":[{"start":50,"value":"count","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":68,"value":"\"0\"","children":[{"start":69,"value":"0","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":22,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I navigate to the Lit SSR demo page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":20,"keywordType":"Context","textWithKeyword":"Given the simple counter displays count \"0\"","stepMatchArguments":[{"group":{"start":34,"value":"\"0\"","children":[{"start":35,"value":"0","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":24,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"When I wait for the simple counter to be hydrated","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"And I click the simple counter increment button","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"Then the simple counter should display count \"1\"","stepMatchArguments":[{"group":{"start":40,"value":"\"1\"","children":[{"start":41,"value":"1","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":29,"pickleLine":26,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I navigate to the Lit SSR demo page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"Then the epoch counter should display a timestamp greater than \"1\"","stepMatchArguments":[{"group":{"start":58,"value":"\"1\"","children":[{"start":59,"value":"1","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":33,"pickleLine":29,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I navigate to the Lit SSR demo page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":30,"keywordType":"Outcome","textWithKeyword":"Then the epoch counter element should not have attribute \"initial-count\"","stepMatchArguments":[{"group":{"start":52,"value":"\"initial-count\"","children":[{"start":53,"value":"initial-count","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":37,"pickleLine":32,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I navigate to the Lit SSR demo page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":38,"gherkinStepLine":33,"keywordType":"Context","textWithKeyword":"Given I note the current epoch counter value","stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":34,"keywordType":"Action","textWithKeyword":"When I wait for the epoch counter to be hydrated","stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":35,"keywordType":"Action","textWithKeyword":"And I click the epoch counter increment button","stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":36,"keywordType":"Outcome","textWithKeyword":"Then the epoch counter should display an incremented value","stepMatchArguments":[]}]},
]; // bdd-data-end