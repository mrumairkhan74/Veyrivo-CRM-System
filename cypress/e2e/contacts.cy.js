// cypress/e2e/contacts.cy.js
describe('Contacts Management', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
    cy.visit('/admin/contacts');
  });

  describe('List Contacts', () => {
    it('should display contacts table', () => {
      cy.get('[data-cy=contacts-table]').should('exist');
    });

    it('should search contacts', () => {
      cy.get('[data-cy=search-input]').type('John');
      cy.waitForApi('apiRequests');
    });

    it('should filter by status', () => {
      cy.get('[data-cy=status-filter]').select('active');
      cy.waitForApi('apiRequests');
    });

    it('should filter by decision maker', () => {
      cy.get('[data-cy=decision-maker-filter]').select('true');
      cy.waitForApi('apiRequests');
    });
  });

  describe('Create Contact', () => {
    it('should create a new contact', () => {
      cy.get('[data-cy=add-contact-button]').click();
      cy.get('[data-cy=contact-first-name]').type('Jane');
      cy.get('[data-cy=contact-last-name]').type('Smith');
      cy.get('[data-cy=contact-email]').type('jane.smith@example.com');
      cy.get('[data-cy=contact-phone]').type('+1-555-0199');
      cy.get('[data-cy=contact-title]').type('CTO');
      cy.get('[data-cy=contact-company]').select('Test Company');
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Contact created successfully');
    });
  });
});