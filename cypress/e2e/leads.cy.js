// cypress/e2e/leads.cy.js
describe('Leads Management', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
  });

  describe('List Leads', () => {
    beforeEach(() => {
      cy.visit('/admin/leads');
    });

    it('should display leads table', () => {
      cy.get('[data-cy=leads-table]').should('exist');
    });

    it('should search leads', () => {
      cy.get('[data-cy=search-input]').type('Test Lead');
      cy.waitForApi('apiRequests');
      cy.get('[data-cy=leads-table]').should('contain', 'Test Lead');
    });

    it('should filter by status', () => {
      cy.get('[data-cy=status-filter]').select('qualified');
      cy.waitForApi('apiRequests');
      cy.get('[data-cy=leads-table]').should('contain', 'qualified');
    });

    it('should filter by temperature', () => {
      cy.get('[data-cy=temperature-filter]').select('hot');
      cy.waitForApi('apiRequests');
    });

    it('should paginate', () => {
      cy.get('[data-cy=pagination-next]').click();
      cy.waitForApi('apiRequests');
      cy.url().should('include', 'page=2');
    });

    it('should sort by column', () => {
      cy.get('[data-cy=sort-title]').click();
      cy.waitForApi('apiRequests');
    });
  });

  describe('Create Lead', () => {
    beforeEach(() => {
      cy.visit('/admin/leads');
    });

    it('should create a new lead', () => {
      cy.get('[data-cy=add-lead-button]').click();
      cy.get('[data-cy=lead-title]').type('New Test Lead');
      cy.get('[data-cy=lead-contact]').type('John Doe');
      cy.get('[data-cy=lead-email]').type('john@example.com');
      cy.get('[data-cy=lead-company]').type('Test Company');
      cy.get('[data-cy=lead-status]').select('new');
      cy.get('[data-cy=lead-temperature]').select('hot');
      cy.get('[data-cy=lead-value]').type('50000');
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Lead created successfully');
      cy.url().should('include', '/admin/leads');
    });

    it('should validate required fields', () => {
      cy.get('[data-cy=add-lead-button]').click();
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Lead title is required');
    });
  });

  describe('View Lead', () => {
    it('should view lead details', () => {
      cy.visit('/admin/leads');
      cy.get('[data-cy=view-lead]').first().click();
      cy.contains('Lead Details').should('be.visible');
    });
  });

  describe('Edit Lead', () => {
    it('should update lead', () => {
      cy.visit('/admin/leads');
      cy.get('[data-cy=edit-lead]').first().click();
      cy.get('[data-cy=lead-title]').clear().type('Updated Lead Title');
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Lead updated successfully');
    });
  });

  describe('Delete Lead', () => {
    it('should delete lead', () => {
      cy.visit('/admin/leads');
      cy.get('[data-cy=delete-lead]').first().click();
      cy.get('[data-cy=confirm-delete]').click();
      cy.shouldShowToast('Lead deleted successfully');
    });
  });
});