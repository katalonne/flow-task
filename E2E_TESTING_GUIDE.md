# E2E Testing Guide - Remindy Dashboard

This guide explains the end-to-end tests for the Remindy Dashboard frontend using Cypress.

## Overview

The e2e tests verify that the frontend makes correct API requests for all major user interactions:
- Creating reminders
- Editing reminders
- Deleting reminders
- Switching between tabs
- Changing sort order

## Test Files

All test files are located in `frontend/cypress/e2e/`:

1. **create-reminder.cy.ts** - Tests for creating new reminders
2. **edit-reminder.cy.ts** - Tests for editing existing reminders
3. **delete-reminder.cy.ts** - Tests for deleting reminders
4. **switch-tabs.cy.ts** - Tests for tab navigation
5. **sorting.cy.ts** - Tests for sorting functionality

## Setup

### Prerequisites

1. Node.js and npm installed
2. Frontend dependencies installed: `npm install` (in frontend directory)
3. Cypress installed: `npm install --save-dev cypress` (already done)

### Configuration

Cypress configuration is in `frontend/cypress.config.ts`:
- Base URL: `http://localhost:3000`
- Viewport: 1280x720
- Timeouts: 10 seconds

## Running Tests

### Start the Frontend Server

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`

### Run Tests

From the `frontend` directory:

**Interactive Mode (Cypress UI):**
```bash
npm run e2e:open
```

**Headless Mode (CLI):**
```bash
npm run e2e:headless
```

**Watch Mode:**
```bash
npm run e2e
```

**Run Specific Test:**
```bash
npx cypress run --spec "cypress/e2e/create-reminder.cy.ts"
```

## Test Details

### Create Reminder Tests
- Verifies POST request is made when creating a reminder
- Checks request payload contains correct data
- Tests Quick Create feature

### Edit Reminder Tests
- Verifies PATCH request is made when editing
- Validates request payload with updated data
- Confirms data refetch after edit

### Delete Reminder Tests
- Verifies DELETE request is made
- Tests delete confirmation dialog
- Confirms data refetch after deletion
- Tests cancel functionality

### Switch Tabs Tests
- Verifies GET request with correct status parameter
- Tests all tabs: All, Scheduled, Completed, Failed
- Confirms pagination resets on tab switch
- Tests tab disable state during loading

### Sorting Tests
- Verifies GET request with sort parameter
- Tests ascending and descending sort
- Tests clearing sort
- Confirms sort persists when switching tabs

## Test IDs Added

The following test IDs were added to components for testing:

- `data-testid="reminder-card"` - Reminder card container
- `data-testid="edit-button"` - Edit button on reminder card
- `data-testid="delete-button"` - Delete button on reminder card
- `data-testid="sort-button"` - Sort dropdown select element

## API Interception

Tests use Cypress API interception to:
- Mock API responses
- Verify requests are made
- Check request parameters and payload
- Avoid making actual API calls

Custom commands in `cypress/support/e2e.ts`:
- `cy.interceptRemindersAPI()` - Sets up all API interceptions
- `cy.waitForAPI(alias)` - Waits for specific API call

## Debugging

### Using Cypress UI
1. Run `npm run e2e:open`
2. Click on test file
3. Use browser DevTools to inspect elements
4. Check Network tab for API calls

### Viewing Test Output
- Screenshots saved in `cypress/screenshots/`
- Videos saved in `cypress/videos/`
- Console logs visible in Cypress UI

### Common Issues

**Tests timeout waiting for API:**
- Ensure backend is running
- Check API base URL in cypress.config.ts
- Verify network connectivity

**Elements not found:**
- Check test IDs match component attributes
- Verify selectors in test files
- Use Cypress UI to inspect elements

## CI/CD Integration

To run tests in CI/CD pipeline:

```bash
# Install dependencies
npm install

# Start frontend in background
npm run dev &

# Wait for server to start
sleep 5

# Run tests
npm run e2e:headless

# Kill background process
kill %1
```

## Best Practices

1. **Keep tests independent** - Each test should work standalone
2. **Use data-testid** - More reliable than text selectors
3. **Wait for API calls** - Use `cy.waitForAPI()` to ensure requests complete
4. **Test user flows** - Focus on what users actually do
5. **Avoid hard waits** - Use Cypress commands that wait intelligently

## Maintenance

When updating components:
1. Ensure test IDs remain consistent
2. Update selectors if HTML structure changes
3. Add new tests for new features
4. Run full test suite before committing

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Testing with Cypress](https://docs.cypress.io/guides/guides/network-requests)

