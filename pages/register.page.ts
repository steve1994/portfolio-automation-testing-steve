import { type Locator, type Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly confirmPasswordField: Locator;
  readonly fullNameField: Locator;
  readonly phoneField: Locator;
  readonly companyNameField: Locator;
  readonly industrySelect: Locator;
  readonly companySizeSelect: Locator;
  readonly createAccountButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailField = page.locator('#email')
    this.passwordField = page.locator('#password');
    this.confirmPasswordField = page.locator('#confirmPassword');
    this.fullNameField = page.locator('#fullName');
    this.phoneField = page.locator('#phone');
    this.companyNameField = page.locator('#companyName');
    this.industrySelect = page.locator('#industry');
    this.companySizeSelect = page.locator('#companySize');
    this.createAccountButton = page.getByRole('button', { name: 'Create Account' });
  }

  async goto() {
    await this.page.goto('https://www.emra.chat/login');
  }
  
}
