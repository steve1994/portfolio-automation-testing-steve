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
    const validEmail = (process.env.VALID_LOGIN_EMAIL) as string;
    const validPassword = (process.env.VALID_LOGIN_PASSWORD) as string;

    // Actions
    await loginPage.login(validEmail, validPassword);

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
