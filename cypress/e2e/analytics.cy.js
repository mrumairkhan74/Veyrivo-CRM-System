// cypress/e2e/analytics.cy.js
describe('Analytics Dashboard', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
    cy.visit('/admin/analytics');
  });

  describe('KPI Cards', () => {
    it('should display all KPI cards', () => {
      cy.contains('Total Leads').should('be.visible');
      cy.contains('Qualified Leads').should('be.visible');
      cy.contains('Active Deals').should('be.visible');
      cy.contains('Conversion Rate').should('be.visible');
      cy.contains('Pipeline Value').should('be.visible');
      cy.contains('Revenue (Month)').should('be.visible');
    });

    it('should show percentage changes', () => {
      cy.get('[data-cy=kpi-card]').each(($el) => {
        cy.wrap($el).should('contain', '%');
      });
    });
  });

  describe('Charts', () => {
    it('should render pipeline funnel chart', () => {
      cy.get('[data-cy=pipeline-funnel-chart]').should('exist');
    });

    it('should render lead status pie chart', () => {
      cy.get('[data-cy=lead-status-pie]').should('exist');
    });

    it('should render leads by source bar chart', () => {
      cy.get('[data-cy=leads-by-source-chart]').should('exist');
    });

    it('should render monthly trends line chart', () => {
      cy.get('[data-cy=monthly-trends-chart]').should('exist');
    });

    it('should render team performance chart', () => {
      cy.get('[data-cy=team-performance-chart]').should('exist');
    });

    it('should render service performance chart', () => {
      cy.get('[data-cy=service-performance-chart]').should('exist');
    });

    it('should render temperature pie chart', () => {
      cy.get('[data-cy=temperature-pie-chart]').should('exist');
    });
  });

  describe('Date Range Filter', () => {
    it('should filter by date range', () => {
      cy.get('[data-cy=date-range-filter]').select('30d');
      cy.waitForApi('apiRequests');
    });

    it('should refresh data', () => {
      cy.get('[data-cy=refresh-button]').click();
      cy.waitForApi('apiRequests');
    });
  });

  describe('Export', () => {
    it('should export analytics data', () => {
      cy.get('[data-cy=export-button]').click();
      cy.shouldShowToast('Export started');
    });
  });
});