import { test, expect } from '@playwright/test';

test('Scenario Login - Test Case 01 - Successfull Login @P0 @SmokeTest', async ({ page }) => {
  // Preconditions
  await page.goto('https://www.emra.chat/login');
  
  // Actions
  await page.getByRole('textbox', { name: 'Email' }).fill('steve.harnadi@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Welcome@12345');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Assertions
  await expect(page.getByRole('heading', { name: 'Emra', exact: true })).toBeVisible();
});

test('Scenario Login - Test Case 02 - Invalid Credentials Failed Login @P0 @SmokeTest', async ({ page }) => {
  // Preconditions
  await page.goto('https://www.emra.chat/login');
  
  // Actions
  await page.getByRole('textbox', { name: 'Email' }).fill('wrongemail@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('abcdefg@123445');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Assertions
  await expect(page.getByText('Invalid credentials')).toBeVisible();
});