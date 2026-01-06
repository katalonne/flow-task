describe("Create Reminder", () => {
  beforeEach(() => {
    cy.mockRemindersAPI();
    cy.visit("/");
    cy.wait("@getReminders");
  });

  it("should make a POST request when creating a new reminder", () => {
    // Click the "Create Reminder" button
    cy.contains("button", "Create Reminder").click();

    // Wait for modal to appear - look for the form
    cy.get('form#reminder-form', { timeout: 5000 }).should("be.visible");

    // Wait for the form to be fully loaded by checking for the date input
    cy.get('form#reminder-form input[type="date"]', { timeout: 5000 }).should("exist");

    // Fill in the form
    cy.get('input[placeholder="e.g. Doctor\'s Appointment"]').type("Test Reminder");
    cy.get('textarea[placeholder="What should the voice say?"]').type("This is a test message");
    cy.get('input[placeholder="555-0000"]').type("5550000000");

    // Set date and time to a future date - use the form context to find the right inputs
    cy.get('form#reminder-form').within(() => {
      cy.get('input[type="date"]').clear().type("2099-12-31");
      cy.get('input[type="time"]').clear().type("23:59");
    });

    // Submit the form using the form's submit method
    cy.get('form#reminder-form').submit();

    // Verify POST request was made
    cy.wait("@createReminder");
  });

  it("should make a POST request with correct payload", () => {
    cy.contains("button", "Create Reminder").click();
    cy.get('form#reminder-form', { timeout: 5000 }).should("be.visible");

    // Wait for the form to be fully loaded by checking for the date input
    cy.get('form#reminder-form input[type="date"]', { timeout: 5000 }).should("exist");

    cy.get('input[placeholder="e.g. Doctor\'s Appointment"]').type("Payload Test");
    cy.get('textarea[placeholder="What should the voice say?"]').type("Test payload message");
    cy.get('input[placeholder="555-0000"]').type("9876543210");

    cy.get('form#reminder-form').within(() => {
      cy.get('input[type="date"]').clear().type("2099-12-31");
      cy.get('input[type="time"]').clear().type("23:59");
    });

    // Submit the form using the form's submit method
    cy.get('form#reminder-form').submit();

    // Verify the request was made with correct data
    cy.wait("@createReminder").then((interception) => {
      expect(interception.request.body).to.have.property("title", "Payload Test");
      expect(interception.request.body).to.have.property("message", "Test payload message");
      // Phone number may be formatted with spaces
      expect(interception.request.body.phone_number).to.match(/\+1\s?9876543210/);
    });
  });


  it("should use Quick Create to make a POST request", () => {
    cy.contains("button", "Quick Create").click();

    // Quick create should open modal with pre-filled data
    cy.get('form#reminder-form', { timeout: 5000 }).should("be.visible");

    // Fill in required fields for quick create
    cy.get('input[placeholder="e.g. Doctor\'s Appointment"]').type("Quick Reminder");
    cy.get('input[placeholder="555-0000"]').type("5550000000");

    // Submit - look for the button with text "Schedule Reminder"
    cy.contains("button", "Schedule Reminder").click();

    // Verify POST request was made
    cy.wait("@createReminder");
  });
});

