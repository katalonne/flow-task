describe("Sorting", () => {
  beforeEach(() => {
    cy.mockRemindersAPI();
    cy.visit("/");
    cy.wait("@getReminders");
  });

  it("should make a GET request when changing sort to ascending", () => {
    // Find and click the sort button
    cy.get('[data-testid="sort-button"]').select("ascending");

    // Verify GET request was made with sort parameter
    cy.wait("@getReminders").then((interception) => {
      expect(interception.request.url).to.include("sort=ascending");
    });
  });

  it("should make a GET request when changing sort to descending", () => {
    cy.get('[data-testid="sort-button"]').select("descending");

    // Verify GET request was made with sort parameter
    cy.wait("@getReminders").then((interception) => {
      expect(interception.request.url).to.include("sort=descending");
    });
  });

  it("should make a GET request when clearing sort", () => {
    // First set a sort option
    cy.get('[data-testid="sort-button"]').select("ascending");
    cy.wait("@getReminders");

    // Then clear it
    cy.get('[data-testid="sort-button"]').select("-");

    // Verify GET request was made without sort parameter
    cy.wait("@getReminders").then((interception) => {
      expect(interception.request.url).not.to.include("sort=");
    });
  });

  it("should update sort value when sort changes", () => {
    cy.get('[data-testid="sort-button"]').select("ascending");

    // Verify the sort button has the correct value
    cy.get('[data-testid="sort-button"]').should("have.value", "ascending");
  });

  it("should maintain sort when switching tabs", () => {
    // Set sort to ascending
    cy.get('[data-testid="sort-button"]').select("ascending");
    cy.wait("@getReminders");

    // Switch to Scheduled tab
    cy.contains("button", "Scheduled").click();

    // Verify sort parameter is still in the request
    cy.wait("@getReminders").then((interception) => {
      expect(interception.request.url).to.include("sort=ascending");
    });
  });

  it("should reset pagination when changing sort", () => {
    cy.get('[data-testid="sort-button"]').select("ascending");

    cy.wait("@getReminders").then((interception) => {
      expect(interception.request.url).to.include("page=1");
    });
  });
});

