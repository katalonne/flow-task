# Cypress E2E Tests

This directory contains end-to-end tests for the Remindy Dashboard using Cypress.

## Test Coverage

The e2e tests verify that API requests are made correctly for the following operations:

### 1. Create Reminder (`create-reminder.cy.ts`)
- Tests that a POST request is made when creating a new reminder
- Verifies the request payload contains correct data
- Tests the Quick Create feature

### 2. Edit Reminder (`edit-reminder.cy.ts`)
- Tests that a PATCH request is made when editing a reminder
- Verifies the request payload contains updated data
- Confirms that data is refetched after editing

### 3. Delete Reminder (`delete-reminder.cy.ts`)
- Tests that a DELETE request is made when deleting a reminder
- Verifies the request is made to the correct endpoint
- Tests the delete confirmation dialog
- Confirms that data is refetched after deletion

### 4. Switch Tabs (`switch-tabs.cy.ts`)
- Tests that a GET request is made when switching between tabs
- Verifies correct status parameters are sent (all, scheduled, completed, failed)
- Confirms pagination resets when switching tabs
- Tests that tabs are disabled during loading

### 5. Sorting (`sorting.cy.ts`)
- Tests that a GET request is made when changing sort order
- Verifies sort parameters are included in requests
- Tests clearing sort filters
- Confirms sort is maintained when switching tabs

## Running Tests

### Open Cypress Test Runner (Interactive)
```bash
npm run e2e:open
```

### Run All Tests (Headless)
```bash
npm run e2e:headless
```

### Run Specific Test File
```bash
npx cypress run --spec "cypress/e2e/create-reminder.cy.ts"
```

### Run Tests in Watch Mode
```bash
npm run e2e
```

## Prerequisites

1. Ensure the frontend development server is running:
   ```bash
   npm run dev
   ```

2. Ensure the backend API is running and accessible at the configured base URL

3. The tests use API interception to verify requests without making actual API calls

## Test Structure

Each test file follows this pattern:

1. **Setup**: Visit the app and intercept API calls
2. **Action**: Perform user interactions (click buttons, fill forms, etc.)
3. **Assertion**: Verify that the correct API request was made

## Custom Commands

The tests use custom Cypress commands defined in `support/e2e.ts`:

- `cy.interceptRemindersAPI()` - Sets up interception for all reminder API endpoints
- `cy.waitForAPI(alias)` - Waits for a specific API call to complete

## Debugging

To debug a specific test:

1. Open Cypress: `npm run e2e:open`
2. Click on the test file you want to debug
3. Use the Cypress UI to step through the test
4. Check the Network tab to see intercepted API calls

## Notes

- Tests assume the app is running on `http://localhost:3000`
- Tests use data-testid attributes for element selection
- API interception is used to verify requests without making actual API calls
- Tests are designed to be independent and can run in any order

