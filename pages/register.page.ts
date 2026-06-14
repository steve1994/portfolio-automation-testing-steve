import { type Locator, type Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly signUpLink: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly confirmPasswordField: Locator;
  readonly nextButton: Locator;
  readonly fullNameField: Locator;
  readonly phoneCombobox: Locator;
  readonly phoneField: Locator;
  readonly companyNameField: Locator;
  readonly industrySelect: Locator;
  readonly companySizeSelect: Locator;
  readonly createAccountButton: Locator;
  readonly emraHeading: Locator;
  readonly emailAlreadyTakenError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
    this.emailField = page.getByRole('textbox', { name: 'Email' });
    this.passwordField = page.getByRole('textbox', { name: 'Password', exact: true });
    this.confirmPasswordField = page.locator('#confirmPassword');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.fullNameField = page.getByRole('textbox', { name: 'Full Name' });
    this.phoneCombobox = page.getByRole('combobox');
    this.phoneField = page.getByRole('textbox', { name: 'Phone Number' });
    this.companyNameField = page.getByRole('textbox', { name: 'Company Name' });
    this.industrySelect = page.getByLabel('Industry');
    this.companySizeSelect = page.getByLabel('Company Size');
    this.createAccountButton = page.getByRole('button', { name: 'Create Account' });
    this.emraHeading = page.getByRole('heading', { name: 'Emra', exact: true });
    this.emailAlreadyTakenError = page.getByText('Email has already been taken');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async clickSignUp() {
    await this.signUpLink.click();
    await this.page.waitForURL('**/signup');
  }

  async fillAccountInformation(email: string, pass: string) {
    await this.emailField.fill(email);
    await this.emailField.press('Tab');
    await this.passwordField.fill(pass);
    await this.emailField.press('Tab');
    await this.confirmPasswordField.fill(pass);
    await this.confirmPasswordField.press('Tab');
    await this.nextButton.click();
  }

  async fillPersonalInformation(fullName: string, phone: string) {
    await this.fullNameField.fill(fullName);
    await this.phoneCombobox.click();
    await this.phoneField.fill(phone);
    await this.nextButton.click();
  }

  async fillCompanyInformation(companyName: string, industry: string, size: string) {
    await this.companyNameField.fill(companyName);
    await this.industrySelect.selectOption(industry);
    await this.companySizeSelect.selectOption(size);
    await this.createAccountButton.click();
  }
}
