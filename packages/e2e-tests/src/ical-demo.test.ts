describe("iCalendar Demo", () => {
  beforeEach(() => {
    cy.visit("/demos/ical");
  });

  it("should display the demo page with form", () => {
    cy.contains("h1", "iCalendar Feed Demo").should("be.visible");
    cy.get("#ical-form").should("be.visible");

    // Check form fields
    cy.get("#title").should("have.value", "Demo Event");
    cy.get("#duration").should("have.value", "60");
    cy.get("#tz").should("exist");
    cy.get("#startAt").should("exist");
    cy.get("#cancelAt").should("exist");
  });

  it("should generate feed URL with form submission", () => {
    // Fill form
    cy.get("#title").clear().type("Test Meeting");
    cy.get("#startAt").type("2025-08-15T10:00");
    cy.get("#duration").clear().type("90");
    cy.get("#tz").select("Europe/Zurich");

    // Submit form
    cy.get("button[type='submit']").click();

    // Check result
    cy.get("#result").should("not.have.class", "d-none");
    cy.get("#feed-url").should("contain.value", "/api/ical/events.ics");
    cy.get("#feed-url").should("contain.value", "title=Test+Meeting");
    cy.get("#feed-url").should("contain.value", "duration=90");
    cy.get("#feed-url").should("contain.value", "tz=Europe%2FZurich");
  });

  it("should handle cancellation parameter", () => {
    cy.get("#title").clear().type("Cancelled Event");
    cy.get("#startAt").type("2025-08-15T10:00");
    cy.get("#cancelAt").type("2025-08-14T10:00");

    cy.get("button[type='submit']").click();

    cy.get("#feed-url").should("contain.value", "cancelAt=");
  });

  it("should copy URL to clipboard", () => {
    // Generate a URL first
    cy.get("#title").clear().type("Copy Test");
    cy.get("#startAt").type("2025-08-15T10:00");
    cy.get("button[type='submit']").click();

    // Test copy button
    cy.get("#copy-btn").click();
    cy.get("#copy-btn").should("contain", "Copied!");

    // Button should revert after timeout
    cy.wait(2100);
    cy.get("#copy-btn").should("contain", "Copy");
  });

  it("should generate download and subscribe links", () => {
    cy.get("#startAt").type("2025-08-15T10:00");
    cy.get("button[type='submit']").click();

    // Check download link
    cy.get("#download-link").should("have.attr", "href").and("include", "/api/ical/events.ics");

    // Check subscribe link (webcal://)
    cy.get("#subscribe-link")
      .should("have.attr", "href")
      .and("match", /^webcal:\/\//);
  });
});

describe("iCalendar API", () => {
  it("should return valid iCal data for basic event", () => {
    cy.request({
      url: "/api/ical/events.ics",
      qs: {
        title: "API Test Event",
        startAt: "2025-08-01T14:30:00Z",
        duration: "60",
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers["content-type"]).to.include("text/calendar");

      const body = response.body;
      expect(body).to.include("BEGIN:VCALENDAR");
      expect(body).to.include("VERSION:2.0");
      expect(body).to.include("BEGIN:VEVENT");
      expect(body).to.include("SUMMARY:API Test Event");
      expect(body).to.include("STATUS:CONFIRMED");
      expect(body).to.include("END:VEVENT");
      expect(body).to.include("END:VCALENDAR");
    });
  });

  it("should handle cancellation correctly", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    cy.request({
      url: "/api/ical/events.ics",
      qs: {
        title: "Cancelled Event",
        startAt: "2025-08-01T14:30:00Z",
        duration: "60",
        cancelAt: pastDate.toISOString(),
      },
    }).then((response) => {
      expect(response.status).to.eq(200);

      const body = response.body;
      expect(body).to.include("METHOD:CANCEL");
      expect(body).to.include("STATUS:CANCELLED");
      expect(body).to.include("SEQUENCE:1");
    });
  });

  it("should handle timezone parameter", () => {
    cy.request({
      url: "/api/ical/events.ics",
      qs: {
        title: "TZ Test",
        startAt: "2025-08-01T14:30:00",
        duration: "60",
        tz: "Europe/Zurich",
      },
    }).then((response) => {
      expect(response.status).to.eq(200);

      const body = response.body;
      expect(body).to.include("BEGIN:VTIMEZONE");
      expect(body).to.include("TZID:Europe/Zurich");
      expect(body).to.include("END:VTIMEZONE");
    });
  });

  it("should return 400 for missing required parameters", () => {
    cy.request({
      url: "/api/ical/events.ics",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.include("Missing required parameter");
    });

    cy.request({
      url: "/api/ical/events.ics",
      qs: { title: "Test" },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.include("Missing required parameter: startAt");
    });
  });

  it("should return 400 for invalid parameters", () => {
    cy.request({
      url: "/api/ical/events.ics",
      qs: {
        title: "Test",
        startAt: "invalid-date",
        duration: "60",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.include("Invalid startAt");
    });

    cy.request({
      url: "/api/ical/events.ics",
      qs: {
        title: "Test",
        startAt: "2025-08-01T14:30:00Z",
        duration: "invalid",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.include("Invalid duration");
    });
  });
});
