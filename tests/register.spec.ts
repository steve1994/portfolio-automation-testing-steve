import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/register.page';
import { faker } from '@faker-js/faker';

test.describe('Register Scenarios', () => {
    let registerPage: RegisterPage;

    test.beforeEach(async ({ page }) => {
        registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.clickSignUp();
    });

    test('TC 01 - Successful Registration Test Case @Register @P0 @SmokeTest', async ({ page }) => {
        // Actions
        // Fill in Account Information
        await registerPage.fillAccountInformation(faker.internet.email(), faker.internet.password());

        // Fill in Personal Information
        await registerPage.fillPersonalInformation(faker.person.fullName(), faker.string.numeric(12));

        // Fill in Company Information
        await registerPage.fillCompanyInformation(faker.company.name(), 'finance', '51-200');

        // Assertions
        await expect(registerPage.emraHeading).toBeVisible();
    });

    test('TC 02 - Unsuccessful Registration Test Case with Already Registered Email @Register @P0 @SmokeTest', async ({ page }) => {
        const alreadyRegisteredEmail = "steve.harnadi@gmail.com";

        // Actions
        // Fill in Account Information
        await registerPage.fillAccountInformation(alreadyRegisteredEmail, faker.internet.password());

        // Fill in Personal Information
        await registerPage.fillPersonalInformation(faker.person.fullName(), faker.string.numeric(12));

        // Fill in Company Information
        await registerPage.fillCompanyInformation(faker.company.name(), 'finance', '51-200');

        // Assertions
        await expect(registerPage.emailAlreadyTakenError).toBeVisible({ timeout: 10000 });
    });
})
