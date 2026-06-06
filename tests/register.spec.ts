import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/register.page';
import { faker } from '@faker-js/faker';

test.describe('Register Scenarios', () => {
    test('TC 01 - Successful Registration Test Case @Register @P0 @SmokeTest', async ({ page }) => {
        const registerPage = new RegisterPage(page);

        await registerPage.goto();
        await registerPage.clickSignUp();

        // Fill in Account Information
        await registerPage.fillAccountInformation(faker.internet.email(), faker.internet.password());

        // Fill in Personal Information
        await registerPage.fillPersonalInformation(faker.person.fullName(), faker.string.numeric(12));

        // Fill in Company Information
        await registerPage.fillCompanyInformation(faker.company.name(), 'finance', '51-200');

        // Assertions
        await expect(page.getByRole('heading', { name: 'Emra' })).toBeVisible();
    });
})

