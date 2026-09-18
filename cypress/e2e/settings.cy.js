// cypress/e2e/settings.cy.js
describe('Settings Page', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
    cy.visit('/admin/settings');
  });

  describe('Profile Tab', () => {
    it('should display profile information', () => {
      cy.contains('Profile').should('be.visible');
      cy.get('[data-cy=profile-name]').should('have.value', 'Admin User');
      cy.get('[data-cy=profile-email]').should('have.value', 'admin@example.com');
    });

    it('should update profile', () => {
      cy.get('[data-cy=profile-name]').clear().type('Updated Name');
      cy.get('[data-cy=profile-phone]').type('+1-555-0100');
      cy.get('[data-cy=save-profile-button]').click();
      cy.shouldShowToast('Profile saved successfully');
    });

    it('should upload avatar', () => {
      cy.get('[data-cy=avatar-upload]').selectFile('cypress/fixtures/avatar.png', { force: true });
      cy.get('[data-cy=save-profile-button]').click();
      cy.shouldShowToast('Profile saved successfully');
    });
  });

  describe('Team Members Tab', () => {
    it('should display team members', () => {
      cy.get('[data-cy=team-tab]').click();
      cy.contains('Team Members').should('be.visible');
    });

    it('should invite team member', () => {
      cy.get('[data-cy=invite-member-button]').click();
      cy.get('[data-cy=invite-email]').type('newmember@example.com');
      cy.get('[data-cy=invite-role]').select('member');
      cy.get('[data-cy=send-invite-button]').click();
      cy.shouldShowToast('Invitation sent');
    });

    it('should update member role', () => {
      cy.get('[data-cy=member-role-select]').first().select('manager');
      cy.shouldShowToast('Role updated');
    });

    it('should remove member', () => {
      cy.get('[data-cy=remove-member]').first().click();
      cy.get('[data-cy=confirm-remove]').click();
      cy.shouldShowToast('Member removed');
    });
  });

  describe('Roles & Permissions Tab', () => {
    it('should display role definitions', () => {
      cy.get('[data-cy=roles-tab]').click();
      cy.contains('Admin').should('be.visible');
      cy.contains('Manager').should('be.visible');
      cy.contains('Member').should('be.visible');
      cy.contains('Viewer').should('be.visible');
    });

    it('should show permissions matrix', () => {
      cy.contains('Leads Management').should('be.visible');
      cy.contains('Deals & Pipeline').should('be.visible');
      cy.contains('Analytics').should('be.visible');
    });
  });

  describe('Integrations Tab', () => {
    it('should display available integrations', () => {
      cy.get('[data-cy=integrations-tab]').click();
      cy.contains('Gmail').should('be.visible');
      cy.contains('Slack').should('be.visible');
      cy.contains('Zoom').should('be.visible');
    });

    it('should connect integration', () => {
      cy.get('[data-cy=connect-gmail]').click();
      cy.origin('accounts.google.com', () => {
        cy.get('[data-cy=allow-button]').click();
      });
      cy.shouldShowToast('Connected');
    });
  });

  describe('Notifications Tab', () => {
    it('should display notification preferences', () => {
      cy.get('[data-cy=notifications-tab]').click();
      cy.contains('New Lead Assigned').should('be.visible');
      cy.contains('Lead Status Changes').should('be.visible');
    });

    it('should toggle notification', () => {
      cy.get('[data-cy=notification-toggle]').first().click();
      cy.shouldShowToast('Preferences saved');
    });
  });

  describe('Security Tab', () => {
    it('should change password', () => {
      cy.get('[data-cy=security-tab]').click();
      cy.get('[data-cy=current-password]').type('oldpassword');
      cy.get('[data-cy=new-password]').type('newpassword123');
      cy.get('[data-cy=confirm-password]').type('newpassword123');
      cy.get('[data-cy=change-password-button]').click();
      cy.shouldShowToast('Password updated');
    });
  });

  describe('Billing Tab', () => {
    it('should display current plan', () => {
      cy.get('[data-cy=billing-tab]').click();
      cy.contains('Current Plan').should('be.visible');
      cy.contains('Professional').should('be.visible');
    });

    it('should display billing history', () => {
      cy.contains('Billing History').should('be.visible');
      cy.contains('$49.00').should('be.visible');
      cy.contains('Paid').should('be.visible');
    });
  });
});