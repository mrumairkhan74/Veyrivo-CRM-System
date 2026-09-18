// cypress/e2e/dashboard.cy.js
describe('Admin Dashboard', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
  });

  it('should display dashboard with stats', () => {
    cy.visit('/admin/dashboard');
    cy.contains('Good Morning').should('be.visible');
    cy.contains('Total Leads').should('be.visible');
    cy.contains('Active Deals').should('be.visible');
    cy.contains('Pipeline Value').should('be.visible');
    cy.contains('Conversion Rate').should('be.visible');
  });

  it('should display pipeline overview', () => {
    cy.visit('/admin/dashboard');
    cy.contains('Pipeline Overview').should('be.visible');
  });

  it('should display recent leads', () => {
    cy.visit('/admin/dashboard');
    cy.contains('Recent Leads').should('be.visible');
  });

  it('should display upcoming activities', () => {
    cy.visit('/admin/dashboard');
    cy.contains('Upcoming Activities').should('be.visible');
  });

  it('should filter by date range', () => {
    cy.visit('/admin/dashboard');
    cy.get('[data-cy=date-filter]').click();
    cy.contains('1 Month').click();
    cy.waitForApi('apiRequests');
  });

  it('should refresh data', () => {
    cy.visit('/admin/dashboard');
    cy.get('[data-cy=refresh-button]').click();
    cy.waitForApi('apiRequests');
  });
});