const TEST_URL = "/lit-ssr-demo";

describe("lit-ssr-demo", () => {
  beforeEach(() => {
    cy.visit(TEST_URL);
  });

  it("is served and shows title", () => {
    cy.get("h1").should("contain", "lit-ssr-demo");
  });

  describe("counter", () => {
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

    it("has epoch-counter element in HTML markup without 'initial-count' attribute", () => {
      // no timeout because were checking the server-rendered HTML markup
      cy.get("epoch-counter", { timeout: 0 }).should("not.have.attr", "initial-count");
    });

    it("clicking on the button increments the epoch", () => {
      cy.get("epoch-counter")
        .shadow()
        .find("time")
        .invoke("text")
        .then((text) => {
          const value = parseInt(text, 10);
          cy.get("epoch-counter")
            .shadow()
            .find("button:not([disabled])") // waits for hydration to complete (button is disabled initially)
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
});
