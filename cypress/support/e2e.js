// cypress/support/e2e.js
import './commands';

// Global setup
beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.intercept('**/api/**', { statusCode: 200 }).as('apiRequests');
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore hydration errors and other non-critical errors
  if (err.message.includes('hydration') || err.message.includes('Minified React error')) {
    return false;
  }
  return true;
});