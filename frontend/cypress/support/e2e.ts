// Cypress support file for e2e tests
// This file is loaded before each test file

// Mock data for reminders
const mockReminders = {
  items: [
    {
      id: "1",
      title: "Test Reminder 1",
      message: "Test message 1",
      phone_number: "+1234567890",
      status: "scheduled",
      scheduled_time_utc: new Date(Date.now() + 3600000).toISOString(),
      timezone: "UTC",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Test Reminder 2",
      message: "Test message 2",
      phone_number: "+0987654321",
      status: "scheduled",
      scheduled_time_utc: new Date(Date.now() + 7200000).toISOString(),
      timezone: "UTC",
      created_at: new Date().toISOString(),
    },
  ],
  total_items: 2,
};

// Intercept and mock API calls
Cypress.Commands.add("mockRemindersAPI", () => {
  // Mock GET /reminders/
  cy.intercept("GET", "**/reminders/**", {
    statusCode: 200,
    body: mockReminders,
  }).as("getReminders");

  // Mock POST /reminders/
  cy.intercept("POST", "**/reminders/**", {
    statusCode: 201,
    body: {
      id: "new-reminder-id",
      title: "New Reminder",
      message: "New message",
      phone_number: "+1234567890",
      status: "scheduled",
      scheduled_time_utc: new Date(Date.now() + 3600000).toISOString(),
      timezone: "UTC",
      created_at: new Date().toISOString(),
    },
  }).as("createReminder");

  // Mock PATCH /reminders/:id
  cy.intercept("PATCH", "**/reminders/**", {
    statusCode: 200,
    body: {
      id: "1",
      title: "Updated Reminder",
      message: "Updated message",
      phone_number: "+1234567890",
      status: "scheduled",
      scheduled_time_utc: new Date(Date.now() + 3600000).toISOString(),
      timezone: "UTC",
      created_at: new Date().toISOString(),
    },
  }).as("updateReminder");

  // Mock DELETE /reminders/:id
  cy.intercept("DELETE", "**/reminders/**", {
    statusCode: 204,
    body: {},
  }).as("deleteReminder");
});

declare global {
  namespace Cypress {
    interface Chainable {
      mockRemindersAPI(): Chainable<void>;
    }
  }
}

export {};

