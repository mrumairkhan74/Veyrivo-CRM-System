// cypress/support/commands.js
/// <reference types="cypress" />

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type(email);
    cy.get('[data-cy=password-input]').type(password);
    cy.get('[data-cy=login-button]').click();
    cy.url().should('include', '/admin/dashboard');
  });
});

// Signup command
Cypress.Commands.add('signup', (name, email, password) => {
  cy.visit('/signup');
  cy.get('[data-cy=name-input]').type(name);
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=confirm-password-input]').type(password);
  cy.get('[data-cy=signup-button]').click();
  cy.url().should('include', '/confirm-email');
});

// Navigate to page
Cypress.Commands.add('navigateTo', (path) => {
  cy.visit(`/admin${path}`);
  cy.url().should('include', path);
});

// Create entity
Cypress.Commands.add('createLead', (leadData) => {
  cy.visit('/admin/leads');
  cy.get('[data-cy=add-lead-button]').click();
  cy.get('[data-cy=lead-title]').type(leadData.title);
  cy.get('[data-cy=lead-contact]').type(leadData.contact);
  cy.get('[data-cy=lead-email]').type(leadData.email);
  cy.get('[data-cy=lead-company]').type(leadData.company);
  cy.get('[data-cy=submit-button]').click();
});

// Create company
Cypress.Commands.add('createCompany', (companyData) => {
  cy.visit('/admin/companies');
  cy.get('[data-cy=add-company-button]').click();
  cy.get('[data-cy=company-name]').type(companyData.name);
  cy.get('[data-cy=company-email]').type(companyData.email);
  cy.get('[data-cy=submit-button]').click();
});

// Create contact
Cypress.Commands.add('createContact', (contactData) => {
  cy.visit('/admin/contacts');
  cy.get('[data-cy=add-contact-button]').click();
  cy.get('[data-cy=contact-first-name]').type(contactData.firstName);
  cy.get('[data-cy=contact-last-name]').type(contactData.lastName);
  cy.get('[data-cy=contact-email]').type(contactData.email);
  cy.get('[data-cy=submit-button]').click();
});

// Create deal
Cypress.Commands.add('createDeal', (dealData) => {
  cy.visit('/admin/deals');
  cy.get('[data-cy=add-deal-button]').click();
  cy.get('[data-cy=deal-title]').type(dealData.title);
  cy.get('[data-cy=deal-value]').type(dealData.value);
  cy.get('[data-cy=submit-button]').click();
});

// Wait for API response
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(`@${alias}`).its('response.statusCode').should('be.oneOf', [200, 201, 204]);
});

// Check toast notification
Cypress.Commands.add('shouldShowToast', (message) => {
  cy.get('[data-cy=toast]').should('contain', message);
});

// Assert element exists
Cypress.Commands.add('shouldExist', { prevSubject: 'optional' }, (subject, selector) => {
  if (subject) {
    return cy.wrap(subject).find(selector).should('exist');
  }
  return cy.get(selector).should('exist');
});

// Assert element not exists
Cypress.Commands.add('shouldNotExist', { prevSubject: 'optional' }, (subject, selector) => {
  if (subject) {
    return cy.wrap(subject).find(selector).should('not.exist');
  }
  return cy.get(selector).should('not.exist');
});

// Fill form field
Cypress.Commands.add('fillField', { prevSubject: 'optional' }, (subject, field, value) => {
  if (subject) {
    return cy.wrap(subject).find(`[data-cy=${field}]`).clear().type(value);
  }
  return cy.get(`[data-cy=${field}]`).clear().type(value);
});

// Submit form
Cypress.Commands.add('submitForm', { prevSubject: 'optional' }, (subject) => {
  if (subject) {
    return cy.wrap(subject).find('[data-cy=submit-button]').click();
  }
  return cy.get('[data-cy=submit-button]').click();
});

// Modal interactions
Cypress.Commands.add('openModal', (modalId) => {
  cy.get(`[data-cy=${modalId}]`).should('be.visible');
});

Cypress.Commands.add('closeModal', (modalId) => {
  cy.get(`[data-cy=${modalId}]`).find('[data-cy=close-modal]').click();
  cy.get(`[data-cy=${modalId}]`).should('not.exist');
});