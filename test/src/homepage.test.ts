import semver from "semver";

const TEST_URL = "/";

describe("Homepage", () => {
  beforeEach(() => {
    cy.visit(TEST_URL);
  });

  it("is served and shows title", () => {
    cy.get("h1").should("contain", "Hello World!");
  });

  describe("Displays Server Config", () => {
    beforeEach(() => {
      cy.get("details").contains("summary", "server config").parent().as("detailsEl");
    });

    it("is initially closed", () => {
      cy.get("@detailsEl").then(($detailsEl) => {
        expect($detailsEl).to.not.have.attr("open");
      });
    });

    it("can be opened", () => {
      cy.get("@detailsEl")
        .find("summary")
        .click()
        .then(() => {
          cy.get("@detailsEl").should("have.attr", "open");
        });
    });

    it("shows server config as JSON", () => {
      cy.get("@detailsEl")
        .find("summary")
        .click()
        .then(() => {
          cy.get("@detailsEl")
            .find("pre")
            .should("exist")
            .then(($pre) => {
              const json = JSON.parse($pre.text());

              // Check if basePath is "/"
              expect(json).to.have.property("basePath", "/");

              // Check if startupTime is a valid ISO date
              expect(new Date(json.startupTime).toISOString()).to.equal(json.startupTime);

              // Check if version is valid semver with major > 0
              expect(json).to.have.property("version");
              const version = semver.parse(json.version);
              expect(version?.major).to.be.greaterThan(0);
            });
        });
    });
  });
});
