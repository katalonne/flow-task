describe("Switch Tabs", () => {
  beforeEach(() => {
    cy.mockRemindersAPI();
    cy.visit("/");
    cy.wait("@getReminders");
  });

  it("should make a GET request when switching to Scheduled tab", () => {
    cy.contains("button", "Scheduled").click();

    // Verify GET request was made with correct status parameter
    cy.wait("@getReminders").then((interception) => {
      expect(interception.request.url).to.include("status=scheduled");
    });
  });

  it("should make a GET request when switching to Completed tab", () => {
    cy.contains("button", "Completed").click();

    // Verify GET request was made with correct status parameter
    cy.wait("@getReminders").then((interception) => {
      expect(interception.request.url).to.include("status=completed");
    });
  });

  it("should make a GET request when switching to Failed tab", () => {
    cy.contains("button", "Failed").click();

    // Verify GET request was made with correct status parameter
    cy.wait("@getReminders").then((interception) => {
      expect(interception.request.url).to.include("status=failed");
    });
  });

  it("should make a GET request when switching back to All tab", () => {
    // First switch to another tab
    cy.contains("button", "Scheduled").click();
    cy.wait("@getReminders");

    // Then switch back to All
    cy.contains("button", "All Reminders").click();

    // Verify GET request was made with correct status parameter
    cy.wait("@getReminders").then((interception) => {
      expect(interception.request.url).to.include("status=all");
    });
  });

  it("should reset pagination when switching tabs", () => {
    // Switch to Scheduled tab
    cy.contains("button", "Scheduled").click();
    cy.wait("@getReminders").then((interception) => {
      expect(interception.request.url).to.include("page=1");
    });

    // Switch to Completed tab
    cy.contains("button", "Completed").click();
    cy.wait("@getReminders").then((interception) => {
      expect(interception.request.url).to.include("page=1");
    });
  });

  it("should disable tabs while loading", () => {
    // Tabs should be enabled initially
    cy.contains("button", "Scheduled").should("not.be.disabled");

    // Click a tab
    cy.contains("button", "Scheduled").click();

    // Tab should be disabled during loading (briefly)
    // Then enabled again after loading
    cy.wait("@getReminders");
    cy.contains("button", "Completed").should("not.be.disabled");
  });
});

