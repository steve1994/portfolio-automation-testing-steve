import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Preconditions
  await page.goto('https://www.emra.chat/login');
  
  // Actions
  await page.getByRole('textbox', { name: 'Email' }).fill('steve.harnadi@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Welcome@12345');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Assertions
  await expect(page.getByRole('heading', { name: 'Emra', exact: true })).toBeVisible();
});