# cypress/e2e/auth.cy.js
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Login', () => {
    it('should login with valid credentials', () => {
      cy.login('test@example.com', 'password123');
      cy.url().should('include', '/admin/dashboard');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      cy.get('[data-cy=email-input]').type('wrong@example.com');
      cy.get('[data-cy=password-input]').type('wrongpassword');
      cy.get('[data-cy=login-button]').click();
      cy.shouldShowToast('Login failed');
    });

    it('should show error for empty fields', () => {
      cy.visit('/login');
      cy.get('[data-cy=login-button]').click();
      cy.shouldShowToast('Email is required');
    });
  });

  describe('Signup', () => {
    it('should signup with valid data', () => {
      const email = `test${Date.now()}@example.com`;
      cy.signup('Test User', email, 'password123');
      cy.url().should('include', '/confirm-email');
    });

    it('should show error for mismatched passwords', () => {
      cy.visit('/signup');
      cy.get('[data-cy=name-input]').type('Test User');
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=confirm-password-input]').type('different');
      cy.get('[data-cy=signup-button]').click();
      cy.shouldShowToast('Passwords do not match');
    });

    it('should show error for short password', () => {
      cy.visit('/signup');
      cy.get('[data-cy=name-input]').type('Test User');
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('short');
      cy.get('[data-cy=confirm-password-input]').type('short');
      cy.get('[data-cy=signup-button]').click();
      cy.shouldShowToast('at least 8 characters');
    });
  });

  describe('Email Confirmation', () => {
    it('should verify email with valid token', () => {
      cy.visit('/confirm-email?token=valid-token&type=signup');
      cy.contains('Email Confirmed!').should('be.visible');
      cy.url().should('include', '/login');
    });

    it('should show error for invalid token', () => {
      cy.visit('/confirm-email?token=invalid-token&type=signup');
      cy.contains('Verification Failed').should('be.visible');
    });

    it('should show expired message for expired token', () => {
      cy.visit('/confirm-email?token=expired-token&type=signup');
      cy.contains('Link Expired').should('be.visible');
    });
  });
});