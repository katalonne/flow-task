describe("Edit Reminder", () => {
  beforeEach(() => {
    cy.mockRemindersAPI();
    cy.visit("/");
    cy.wait("@getReminders");
  });

  it("should make a PATCH request when editing a reminder", () => {
    // Find and click the edit button on the first reminder card
    cy.get('[data-testid="reminder-card"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click();
    });

    // Wait for modal to appear
    cy.get('form#reminder-form', { timeout: 5000 }).should("be.visible");

    // Modify the title
    cy.get('input[placeholder="e.g. Doctor\'s Appointment"]').clear().type("Updated Title");

    // Submit the form
    cy.contains("button", "Save Changes").click();

    // Verify PATCH request was made
    cy.wait("@updateReminder");
  });

  it("should make a PATCH request with correct payload", () => {
    cy.get('[data-testid="reminder-card"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click();
    });

    cy.get('form#reminder-form', { timeout: 5000 }).should("be.visible");

    // Update multiple fields
    cy.get('input[placeholder="e.g. Doctor\'s Appointment"]').clear().type("New Title");
    cy.get('textarea[placeholder="What should the voice say?"]').clear().type("New message content");

    cy.contains("button", "Save Changes").click();

    // Verify the request contains updated data
    cy.wait("@updateReminder").then((interception) => {
      expect(interception.request.body).to.have.property("title", "New Title");
      expect(interception.request.body).to.have.property("message", "New message content");
    });
  });

  it("should update reminder and refetch data", () => {
    cy.get('[data-testid="reminder-card"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click();
    });

    cy.get('form#reminder-form', { timeout: 5000 }).should("be.visible");
    cy.get('input[placeholder="e.g. Doctor\'s Appointment"]').clear().type("Refetch Test");

    cy.contains("button", "Save Changes").click();

    // Verify PATCH request
    cy.wait("@updateReminder");

    // Verify GET request is made to refetch data
    cy.wait("@getReminders");
  });
});

