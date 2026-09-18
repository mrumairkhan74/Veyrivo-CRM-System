// cypress/e2e/companies.cy.js
describe('Companies Management', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
    cy.visit('/admin/companies');
  });

  describe('List Companies', () => {
    it('should display companies table', () => {
      cy.get('[data-cy=companies-table]').should('exist');
    });

    it('should search companies', () => {
      cy.get('[data-cy=search-input]').type('Acme');
      cy.waitForApi('apiRequests');
    });

    it('should filter by status', () => {
      cy.get('[data-cy=status-filter]').select('active');
      cy.waitForApi('apiRequests');
    });

    it('should filter by industry', () => {
      cy.get('[data-cy=industry-filter]').select('Technology');
      cy.waitForApi('apiRequests');
    });

    it('should paginate', () => {
      cy.get('[data-cy=pagination-next]').click();
      cy.waitForApi('apiRequests');
    });
  });

  describe('Create Company', () => {
    it('should create a new company', () => {
      cy.get('[data-cy=add-company-button]').click();
      cy.get('[data-cy=company-name]').type('Test Company Inc');
      cy.get('[data-cy=company-email]').type('info@testcompany.com');
      cy.get('[data-cy=company-phone]').type('+1-555-0123');
      cy.get('[data-cy=company-website]').type('https://testcompany.com');
      cy.get('[data-cy=company-status]').select('active');
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Company created successfully');
    });
  });

  describe('View Company', () => {
    it('should view company details', () => {
      cy.get('[data-cy=view-company]').first().click();
      cy.contains('Company Details').should('be.visible');
      cy.contains('Contacts').should('be.visible');
      cy.contains('Leads').should('be.visible');
    });
  });

  describe('Edit Company', () => {
    it('should update company', () => {
      cy.get('[data-cy=edit-company]').first().click();
      cy.get('[data-cy=company-name]').clear().type('Updated Company Name');
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Company updated successfully');
    });
  });

  describe('Delete Company', () => {
    it('should delete company', () => {
      cy.get('[data-cy=delete-company]').first().click();
      cy.get('[data-cy=confirm-delete]').click();
      cy.shouldShowToast('Company deleted successfully');
    });
  });
});