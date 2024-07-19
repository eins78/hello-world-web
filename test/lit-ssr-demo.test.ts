/// <reference types="cypress" />

const TEST_URL = "/lit-ssr-demo";

describe("lit-ssr-demo", () => {
  beforeEach(() => {
    cy.visit(TEST_URL);
  });

  it("is served and shows titel", () => {
    cy.get("h1").should("contain", "lit-ssr-demo");
  });

  it("shows counter with epoch", () => {
    cy.get("epoch-counter")
      .shadow()
      .find("time")
      .invoke("text")
      .then((text) => {
        const value = parseInt(text, 10);
        expect(value).to.be.greaterThan(1);
      });
  });

  it("clicking on the button increments the epoch", () => {
    cy.get("epoch-counter")
      .shadow()
      .find("time")
      .invoke("text")
      .wait(100) // FIXME: This is a hack to wait for hydration to complete
      .then((text) => {
        const value = parseInt(text, 10);
        cy.get("epoch-counter")
          .shadow()
          .find("button")
          .click()
          .then(() => {
            cy.get("epoch-counter")
              .shadow()
              .find("time")
              .invoke("text")
              .then((newText) => {
                const newValue = parseInt(newText, 10);
                expect(newValue).to.equal(value + 1);
              });
          });
      });
  });
});
