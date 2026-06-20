import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { faker } from '@faker-js/faker';
import { pushTestResultToAgentQ } from '../helper/agentq-helper';

test.describe('Login Scenarios', () => {
  let loginPage: LoginPage;
  let testStartTime: number;

  test.beforeEach(async ({ page }) => {
    testStartTime = Date.now();
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('8 - TC 01 - Login with Valid Credentials @Login @P0 @SmokeTest', async ({ page }) => {
    const validEmail = (process.env.VALID_LOGIN_EMAIL) as string;
    const validPassword = (process.env.VALID_LOGIN_PASSWORD) as string;

    // Actions
    await loginPage.login(validEmail, validPassword);

    // Assertions
    await expect(loginPage.emraHeading).toBeVisible();
  });

  test('9 - TC 02 - Login with Invalid Credentials @Login @P0 @SmokeTest', async ({ page }) => {
    // Actions
    await loginPage.login(faker.internet.email(), faker.internet.password());

    // Assertions
    await expect(page.getByText('Invalid credentials')).toBeVisible({ timeout: 10000 });
  });

  test.afterEach(async ({}, testInfo) => {
    const executionTime = Date.now() - testStartTime;
    const errorDetails = testInfo.errors.map(e => e.message).join('; ');
    const title = testInfo.title ?? 'Unknown test';
    const status = testInfo.status ?? 'unknown';
    await pushTestResultToAgentQ(title, status, executionTime, errorDetails);
  });
});
