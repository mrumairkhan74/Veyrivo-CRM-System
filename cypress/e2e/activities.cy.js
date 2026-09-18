// cypress/e2e/activities.cy.js
describe('Activities Management', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
    cy.visit('/admin/activities');
  });

  describe('List View', () => {
    it('should display activities table', () => {
      cy.get('[data-cy=activities-table]').should('exist');
    });

    it('should filter by type', () => {
      cy.get('[data-cy=type-filter]').select('call');
      cy.waitForApi('apiRequests');
    });

    it('should filter by status', () => {
      cy.get('[data-cy=status-filter]').select('completed');
      cy.waitForApi('apiRequests');
    });

    it('should filter by priority', () => {
      cy.get('[data-cy=priority-filter]').select('high');
      cy.waitForApi('apiRequests');
    });
  });

  describe('Calendar View', () => {
    it('should switch to calendar view', () => {
      cy.get('[data-cy=calendar-view-button]').click();
      cy.get('[data-cy=calendar-grid]').should('exist');
    });

    it('should navigate months', () => {
      cy.get('[data-cy=calendar-prev]').click();
      cy.get('[data-cy=calendar-next]').click();
      cy.get('[data-cy=calendar-today]').click();
    });
  });

  describe('Create Activity', () => {
    it('should create a call activity', () => {
      cy.get('[data-cy=add-activity-button]').click();
      cy.get('[data-cy=activity-title]').type('Follow up call');
      cy.get('[data-cy=activity-type]').select('call');
      cy.get('[data-cy=activity-contact]').type('John Doe');
      cy.get('[data-cy=activity-scheduled]').type('2026-09-20T14:00');
      cy.get('[data-cy=activity-duration]').type('30');
      cy.get('[data-cy=activity-notes]').type('Follow up on proposal');
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Activity created successfully');
    });

    it('should create a meeting activity', () => {
      cy.get('[data-cy=add-activity-button]').click();
      cy.get('[data-cy=activity-type]').select('meeting');
      cy.get('[data-cy=activity-title]').type('Demo meeting');
      cy.get('[data-cy=activity-scheduled]').type('2026-09-25T10:00');
      cy.get('[data-cy=activity-duration]').type('60');
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Activity created successfully');
    });

    it('should create a task', () => {
      cy.get('[data-cy=add-activity-button]').click();
      cy.get('[data-cy=activity-type]').select('task');
      cy.get('[data-cy=activity-title]').type('Send proposal');
      cy.get('[data-cy=activity-priority]').select('high');
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Activity created successfully');
    });
  });

  describe('Edit Activity', () => {
    it('should update activity status', () => {
      cy.get('[data-cy=edit-activity]').first().click();
      cy.get('[data-cy=activity-status]').select('completed');
      cy.get('[data-cy=activity-outcome]').type('Client approved');
      cy.get('[data-cy=submit-button]').click();
      cy.shouldShowToast('Activity updated successfully');
    });
  });

  describe('Delete Activity', () => {
    it('should delete activity', () => {
      cy.get('[data-cy=delete-activity]').first().click();
      cy.get('[data-cy=confirm-delete]').click();
      cy.shouldShowToast('Activity deleted successfully');
    });
  });

  describe('Upcoming & Overdue', () => {
    it('should show upcoming activities', () => {
      cy.get('[data-cy=upcoming-tab]').click();
      cy.contains('Upcoming Activities').should('be.visible');
    });

    it('should show overdue activities', () => {
      cy.get('[data-cy=overdue-tab]').click();
      cy.contains('Overdue Activities').should('be.visible');
    });
  });
});