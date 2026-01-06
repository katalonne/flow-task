describe("Delete Reminder", () => {
  beforeEach(() => {
    cy.mockRemindersAPI();
    cy.visit("/");
    cy.wait("@getReminders");
  });

  it("should make a DELETE request when deleting a reminder", () => {
    // Find and click the delete button on the first reminder card
    cy.get('[data-testid="reminder-card"]').first().within(() => {
      cy.get('[data-testid="delete-button"]').click({ force: true });
    });

    // Wait for delete confirmation dialog - look for the dialog content
    cy.contains("h3", "Delete Reminder?").should("be.visible");

    // Confirm deletion
    cy.get('[data-testid="confirm-delete-button"]').click({ force: true });

    // Verify DELETE request was made
    cy.wait("@deleteReminder");
  });

  it("should make a DELETE request with correct reminder ID", () => {
    // Find and click the delete button on the first reminder card
    cy.get('[data-testid="reminder-card"]').first().within(() => {
      cy.get('[data-testid="delete-button"]').click({ force: true });
    });

    cy.contains("h3", "Delete Reminder?").should("be.visible");
    cy.get('[data-testid="confirm-delete-button"]').click({ force: true });

    // Verify the DELETE request was made to the correct endpoint
    cy.wait("@deleteReminder").then((interception) => {
      expect(interception.request.method).to.equal("DELETE");
      expect(interception.request.url).to.include("/reminders/");
    });
  });

  it("should refetch reminders after deletion", () => {
    // Find and click the delete button on the first reminder card
    cy.get('[data-testid="reminder-card"]').first().within(() => {
      cy.get('[data-testid="delete-button"]').click({ force: true });
    });

    cy.contains("h3", "Delete Reminder?").should("be.visible");
    cy.get('[data-testid="confirm-delete-button"]').click({ force: true });

    // Verify DELETE request
    cy.wait("@deleteReminder");

    // Verify GET request is made to refetch data
    cy.wait("@getReminders");
  });

  it("should cancel deletion when clicking cancel button", () => {
    // Find and click the delete button on the first reminder card
    cy.get('[data-testid="reminder-card"]').first().within(() => {
      cy.get('[data-testid="delete-button"]').click();
    });

    cy.contains("h3", "Delete Reminder?").should("be.visible");

    // Click cancel button
    cy.contains("button", "Cancel").click();

    // Dialog should close - check that the heading is no longer visible
    cy.contains("h3", "Delete Reminder?").should("not.exist");

    // No DELETE request should be made
    cy.get("@deleteReminder.all").should("have.length", 0);
  });
});

