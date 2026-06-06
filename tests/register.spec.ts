import { test, expect } from '@playwright/test';

test('TC 01 - Successful Registration Test Case @Register @P0 @SmokeTest', async ({ page }) => {
  await page.goto('https://www.emra.chat/login');
  await page.getByRole('link', { name: 'Sign up' }).click();

  // Fill in Account Information
  await page.getByRole('textbox', { name: 'Email' }).fill('steve.harnadi+2@gmail.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Welcome@12345');
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Welcome@12345');
  await page.getByRole('button', { name: 'Next' }).click();

  // Fill in Personal Information
  await page.getByRole('textbox', { name: 'Full Name' }).fill('Steve Immanuel Harnadi v2');
  await page.getByRole('combobox').click();
  await page.getByRole('textbox', { name: 'Phone Number' }).fill('813432542555');
  await page.getByRole('button', { name: 'Next' }).click();

  // Fill in Company Information
  await page.getByRole('textbox', { name: 'Company Name' }).fill('Company Steve v2');
  await page.getByLabel('Industry').selectOption('finance');
  await page.getByLabel('Company Size').selectOption('51-200');
  await page.getByRole('button', { name: 'Create Account' }).click();

  // Assertions
  await expect(page.getByRole('heading', { name: 'Emra' })).toBeVisible();
});