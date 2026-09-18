// cypress/e2e/deals.cy.js
describe('Deals Management', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
    cy.visit('/admin/deals');
  });

  describe('Kanban Board', () => {
    it('should display kanban board with stages', () => {
      cy.get('[data-cy=kanban-board]').should('exist');
      cy.contains('New').should('be.visible');
      cy.contains('Qualified').should('be.visible');
      cy.contains('Proposal').should('be.visible');
      cy.contains('Negotiation').should('be.visible');
      cy.contains('Won').should('be.visible');
      cy.contains('Lost').should('be.visible');
    });

    it('should show deal count per stage', () => {
      cy.get('[data-cy=stage-new]').should('contain', '3');
      cy.get('[data-cy=stage-qualified]').should('contain', '2');
    });

    it('should show pipeline summary', () => {
      cy.contains('Pipeline Summary').should('be.visible');
      cy.contains('Total Value').should('be.visible');
      cy.contains('Weighted Value').should('be.visible');
    });
  });

  describe('Create Deal', () => {
    it('should create a new deal', () => {
      cy.get('[data-cy=add-deal-button]').click();
      cy.get('[data-cy=deal-title]').type('Enterprise Deal');
      cy.get('[data-cy=deal-company]').type('Enterprise Corp');
      cy.get('[data-cy=deal-contact]').type('Jane Smith');
      cy.get('[data-cy=deal-value]').type('50000');
      cy.get('[data-cy=deal-stage]').select('qualified');
      cy.get('[data-cy=deal-probability]').type('75');
      cy.get('[data-cy=deal-close-date]').type('2026-12-31');
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Deal created successfully');
    });
  });

  describe('Move Deal Between Stages', () => {
    it('should drag and drop deal between stages', () => {
      cy.get('[data-cy=deal-card]').first().drag('[data-cy=stage-proposal]');
      cy.waitForApi('apiRequests');
      cy.get('[data-cy=stage-proposal]').should('contain', 'Enterprise Deal');
    });
  });

  describe('View Deal', () => {
    it('should view deal details', () => {
      cy.get('[data-cy=view-deal]').first().click();
      cy.contains('Deal Details').should('be.visible');
      cy.contains('Activities').should('be.visible');
    });
  });

  describe('Edit Deal', () => {
    it('should update deal', () => {
      cy.get('[data-cy=edit-deal]').first().click();
      cy.get('[data-cy=deal-value]').clear().type('75000');
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Deal updated successfully');
    });
  });

  describe('Delete Deal', () => {
    it('should delete deal', () => {
      cy.get('[data-cy=delete-deal]').first().click();
      cy.get('[data-cy=confirm-delete]').click();
      cy.shouldShowToast('Deal deleted successfully');
    });
  });
});