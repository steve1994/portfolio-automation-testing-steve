import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { faker } from '@faker-js/faker';

test.describe('Login Scenarios', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC 01 - Login with Valid Credentials @Login @P0 @SmokeTest', async ({ page }) => {
    // Actions
    await loginPage.login('steve.harnadi@gmail.com', 'Welcome@12345');
    
    // Assertions
    await expect(loginPage.emraHeading).toBeVisible();
  });

  test('TC 02 - Login with Invalid Credentials @Login @P0 @SmokeTest', async ({ page }) => {
    // Actions
    await loginPage.login(faker.internet.email(), faker.internet.password());

    // Assertions
    await expect(page.getByText('Invalid credentials')).toBeVisible({ timeout: 10000 });
  });
});
