import { test, expect } from '@playwright/test';
import { ContactPage } from '../../pages/contact.page';
import { TagPage } from '../../pages/tag.page';
import { LoginPage } from '../../pages/login.page';
import userData from '../../data/user.json' with { type: 'json' };
import { faker } from '@faker-js/faker';
import {
  auth,
  createContact,
  createTag,
} from '../../helper/api-helper';
import { pushTestResultToAgentQ } from '../../helper/agentq-helper';

// ============================================================
// Data uji (test data) untuk kontak dan tag
// ============================================================
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.emra.chat';

const email = userData.valid_user_staging.email;
const password = userData.valid_user_staging.password;

// Kontak valid (positif)
const validContact = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: '+628555123456',
};

// Kontak untuk edit (positif)
const updatedContact = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: '+628555999999',
};

// Tag
const tagName = `Tag ${faker.lorem.word()} ${Date.now()}`;
const tagColor = 'Yellow';;
const updatedTagName = `Edited Tag ${faker.lorem.word()} ${Date.now()}`;

// Pesan error yang diharapkan (berdasarkan Expected Result AgentQ)
const MSG_REQUIRED = 'Name or primary phone number is required';
const MSG_INVALID_PHONE = 'Phone Number is invalid';
const MSG_INVALID_COUNTRY_CODE = "Phone Number Doesn't Contain Valid Country Code";
const MSG_DUPLICATE_422 = 'Request failed with status code 422';
const MSG_NOT_FOUND_404 = 'Request failed with status code 404';

/**
 * Membuat kontak melalui API untuk kebutuhan precondition
 * "User has already had existing contact data created inside Contacts Menu."
 */
async function createExistingContact(request: any, accessToken: string) {
  const contactPayload = {
    contact: {
      name: validContact.name,
      phone: validContact.phone,
      email: validContact.email,
      active: true,
      tags: [],
      metadata: {},
    },
  };
  const response = await createContact(request, API_BASE_URL, accessToken, contactPayload);
  expect(response.status()).toBe(201);
  const body = await response.json();
  return body.data.contact;
}

/**
 * Membuat tag melalui API untuk kebutuhan precondition
 * "User has already created the new tag's name under /contact/tags menu."
 */
async function createExistingTag(request: any, accessToken: string, name: string) {
  const tagPayload = { tag: { name, color: tagColor } };
  const response = await createTag(request, API_BASE_URL, accessToken, tagPayload);
  expect(response.status()).toBe(201);
  const body = await response.json();
  return body.data.tag;
}

test.describe('Contact Management E2E Testing (AgentQ TC 26-44)', () => {
  let contactPage: ContactPage;
  let tagPage: TagPage;
  let loginPage: LoginPage;
  let testStartTime: number;

  // Precondition (umum): user sudah berhasil login dengan kredensial valid.
  // Diimplementasikan dengan login UI reguler (mirip test case no 8 / TC 01 di
  // tests/e2e/login.spec.ts): buka /login, isi email/password, klik Sign In,
  // lalu verifikasi halaman dashboard (Emra heading) muncul.
  test.beforeEach(async ({ page }) => {
    testStartTime = Date.now();

    loginPage = new LoginPage(page);
    contactPage = new ContactPage(page);
    tagPage = new TagPage(page);

    // Step: buka halaman login dan lakukan login via UI (regular login)
    await loginPage.goto();
    await loginPage.login(email, password);

    // Verifikasi user sudah ter-autentikasi (ada di halaman dashboard/home)
    await expect(loginPage.emraHeading).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 26 - Add New Contact
  // --------------------------------------------------------------------------
  test('26 - TC 26 - Add New Contact @Contacts @P0 @Positive @SmokeTest', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has new designated contact data want to be added into Contacts Menu.

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User click "+ Add Contact" button.
    await contactPage.clickAddContact();

    // 4-6. User input Basic Information - Name, Primary Email, Primary Phone
    await contactPage.fillContactInformation(
      validContact.name,
      validContact.email,
      validContact.phone
    );

    // 7. User click "Create Contact" button.
    await contactPage.clickCreateContact();

    // Tunggu kontak baru muncul di daftar
    await page.waitForTimeout(2000);

    // ===================== Assertion (Expected Result) =====================
    // 1. User successfully adds new designated contact data into /contacts menu.
    // 2. New designated contact data is displayed in /contacts menu.
    await expect(contactPage.contactRow(validContact.name)).toBeVisible({
      timeout: 10000,
    });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 27 - Add New Contact with Empty Name and Phone Number
  // --------------------------------------------------------------------------
  test('27 - TC 27 - Add New Contact with Empty Name and Phone Number @Contacts @P1 @Negative', async ({
    page,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User click "+ Add Contact" button.
    await contactPage.clickAddContact();

    // 4. User let the name field and primary phone's field to be empty and click "Create Contact" button.
    await contactPage.fillName(validContact.name); // isi name dulu untuk membuka form
    await contactPage.clearField(contactPage.nameInput);
    await contactPage.clearField(contactPage.phoneInput);
    await contactPage.clickCreateContact();

    // ===================== Assertion (Expected Result) =====================
    // 1. User is forbidden to add new designated contact with empty name and phone number.
    // 2. Alert error displaying "Name or Primary Phone is required" is displayed.
    await expect(page.getByText(MSG_REQUIRED)).toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 28 - Add New Contact with Invalid Phone Number Format
  // --------------------------------------------------------------------------
  test('28 - TC 28 - Add New Contact with Invalid Phone Number Format @Contacts @P1 @Negative', async ({
    page,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User click "+ Add Contact" button.
    await contactPage.clickAddContact();

    // 4-5. User input Basic Information - Name field dan Primary Email
    await contactPage.fillName(validContact.name);
    await contactPage.fillEmail(validContact.email);

    // 6. User input Basic Information - Primary Phone dengan format invalid (contoh: "fdsfadfassdf")
    await contactPage.fillPhone('fdsfadfassdf');

    // 7. User click "Create Contact" button.
    await contactPage.clickCreateContact();

    // ===================== Assertion (Expected Result) =====================
    // 1. User is forbidden to add new designated contact with invalid phone number.
    // 2. Alert error displaying "Phone Number is invalid" is displayed.
    await expect(page.getByText(MSG_INVALID_PHONE)).toBeVisible({
      timeout: 10000,
    });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 29 - Add New Contact with Non-valid Country Code Number
  // --------------------------------------------------------------------------
  test('29 - TC 29 - Add New Contact with Non-valid Country Code Number @Contacts @P1 @Edge', async ({
    page,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User click "+ Add Contact" button.
    await contactPage.clickAddContact();

    // 4-5. User input Basic Information - Name field dan Primary Email
    await contactPage.fillName(validContact.name);
    await contactPage.fillEmail(validContact.email);

    // 6. User input Basic Information - Primary Phone dengan invalid country code (contoh: +111424244244)
    await contactPage.fillPhone('+111424244244');

    // 7. User click "Create Contact" button.
    await contactPage.clickCreateContact();

    // ===================== Assertion (Expected Result) =====================
    // 1. User is forbidden to add new designated contact with invalid phone number.
    // 2. Alert error displaying "Phone Number Doesn't Contain Valid Country Code" is displayed.
    await expect(page.getByText(MSG_INVALID_COUNTRY_CODE)).toBeVisible({
      timeout: 10000,
    });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 30 - View Contact Details
  // --------------------------------------------------------------------------
  test('30 - TC 30 - View Contact Details @Contacts @P0 @Positive @SmokeTest', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has already had existing contact data created inside Contacts Menu.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    const existingContact = await createExistingContact(request, accessToken);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User navigate to the existing contact data and click eye icon at action's column.
    await contactPage.clickViewContact(existingContact.name);

    // ===================== Assertion (Expected Result) =====================
    // 1. User successfully displays Contact Detail's Page.
    // 2. All datas inside Contact Detail has same value with which displayed at Contacts menu.
    await expect(contactPage.contactDetailHeading).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(existingContact.name)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(existingContact.phones[0]['phone_number'])).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(existingContact.emails[0]['email'])).toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 31 - Edit New Contact
  // --------------------------------------------------------------------------
  test('31 - TC 31 - Edit New Contact @Contacts @P0 @Positive @SmokeTest', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has already had existing contact data created inside Contacts Menu.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    const existingContact = await createExistingContact(request, accessToken);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User navigate to the existing contact data and click edit icon at action's column.
    await contactPage.clickEditContact(existingContact.name);

    // 4-6. User edit input Basic Information - Name, Primary Email, Primary Phone dengan nilai baru
    await contactPage.fillName(updatedContact.name);
    await contactPage.fillEmail(updatedContact.email);
    await contactPage.fillPhone(updatedContact.phone);

    // 7. User click "Save Changes" button.
    await contactPage.clickSaveChanges();

    // ===================== Assertion (Expected Result) =====================
    // 1. User successfully edits existing contact data inside /contacts menu
    // 2. User redirect into Contact Detail's page.
    // 3. The edited contact data is displayed at Contact Detail's page.
    await expect(contactPage.contactDetailHeading).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(updatedContact.name)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(updatedContact.phone)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(updatedContact.email)).toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 32 - Edit New Contact with Empty Name and Phone Number
  // --------------------------------------------------------------------------
  test('32 - TC 32 - Edit New Contact with Empty Name and Phone Number @Contacts @P1 @Negative', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has already had existing contact data created inside Contacts Menu.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    const existingContact = await createExistingContact(request, accessToken);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User navigate to the existing contact data and click edit icon at action's column.
    await contactPage.clickEditContact(existingContact.name);

    // 4. User edit input Basic Information's Name dan Phone Number dengan empty value.
    await contactPage.fillName('');
    await contactPage.fillPhone('');

    // 5. User click "Save Changes" button.
    await contactPage.clickSaveChanges();

    // ===================== Assertion (Expected Result) =====================
    // 1. User is forbidden to edit new designated contact with empty name and phone number.
    // 2. Alert error displaying "Name or Primary Phone is required" is displayed.
    await expect(page.getByText(MSG_REQUIRED)).toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 33 - Edit New Contact with Invalid Phone Number Format
  // --------------------------------------------------------------------------
  test('33 - TC 33 - Edit New Contact with Invalid Phone Number Format @Contacts @P1 @Negative', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has already had existing contact data created inside Contacts Menu.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    const existingContact = await createExistingContact(request, accessToken);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User navigate to the existing contact data and click edit icon at action's column.
    await contactPage.clickEditContact(existingContact.name);

    // 4-6. User edit input Basic Information - Name, Primary Email, Primary Phone dengan invalid phone
    await contactPage.fillName(updatedContact.name);
    await contactPage.fillEmail(updatedContact.email);
    await contactPage.fillPhone('fdsfafasdsdfasf');

    // 7. User click "Save Changes" button.
    await contactPage.clickSaveChanges();

    // ===================== Assertion (Expected Result) =====================
    // 1. User is forbidden to edit new designated contact with invalid phone number.
    // 2. Alert error displaying "Phone Number is invalid" is displayed.
    await expect(page.getByText(MSG_INVALID_PHONE)).toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 34 - Create New Tag
  // --------------------------------------------------------------------------
  test('34 - TC 34 - Create New Tag @Contacts @P0 @Positive @SmokeTest', async ({
    page,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has new tag name want to be added into the system.

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contact/tags menu.
    await tagPage.gotoTags();

    // 3. User click "Create Tag" button.
    await tagPage.clickCreateTag();

    // 4. User input new tag name in Tag Name field and choose color.
    await tagPage.fillTagName(tagName);
    await page.getByRole('button', { name: tagColor }).click();

    // 5. User click "Create Tag" button inside modal.
    await tagPage.clickCreateTagInModal();

    // Tunggu tag baru muncul di daftar
    await page.waitForTimeout(2000);

    // ===================== Assertion (Expected Result) =====================
    // 1. User successfully add new tag name into the system.
    // 2. User can view the new tag name in the list of /contact/tags menu.
    await tagPage.tagRow(tagName).scrollIntoViewIfNeeded();
    await expect(tagPage.tagRow(tagName)).toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 35 - Create New Tag with Already Used Name
  // --------------------------------------------------------------------------
  test('35 - TC 35 - Create New Tag with Already Used Name @Contacts @P1 @Negative', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has predefined existing tag name want to be added into the system.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    const existingTag = await createExistingTag(request, accessToken, tagName);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contact/tags menu.
    await tagPage.gotoTags();

    // 3. User click "Create Tag" button.
    await tagPage.clickCreateTag();

    // 4. User input existing tag name in Tag Name field and choose color.
    await tagPage.fillTagName(existingTag.name);
    await tagPage.selectTagColor(tagColor);

    // 5. User click "Create Tag" button inside modal.
    await tagPage.clickCreateTagInModal();

    // ===================== Assertion (Expected Result) =====================
    // 1. User cannot add existing tag name into the system.
    // 2. Alert error written "Request failed with status code 422" will be displayed.
    await expect(page.getByText(MSG_DUPLICATE_422)).toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 36 - Create New Tag with Empty Name
  // --------------------------------------------------------------------------
  test('36 - TC 36 - Create New Tag with Empty Name @Contacts @P1 @Negative', async ({
    page,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contact/tags menu.
    await tagPage.gotoTags();

    // 3. User click "Create Tag" button.
    await tagPage.clickCreateTag();

    // 4. User leave the blank Tag Name field.
    await tagPage.clearTagName();

    // 5. User click "Create Tag" button inside modal.
    await tagPage.clickCreateTagInModal();

    // ===================== Assertion (Expected Result) =====================
    // 1. User cannot add new tag with empty tag name.
    // 2. "Create Tag" button is disabled if the field tag name is empty.
    await expect(tagPage.createTagInModalButton).toBeDisabled({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 37 - Assign Tag for Existing Contact
  // --------------------------------------------------------------------------
  test('37 - TC 37 - Assign Tag for Existing Contact @Contacts @P1 @Positive', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has already had existing contact data created inside Contacts Menu.
    // 3. User has already created the new tag's name under /contact/tags menu.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    await createExistingContact(request, accessToken);
    await createExistingTag(request, accessToken, tagName);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User navigate to the existing contact data and click edit icon at action's column.
    await contactPage.clickEditContact(validContact.name);

    // 4. User add the new tag's name under Tags Section by typing the name and press enter.
    //    (Asumsi: input tag tersedia pada form edit kontak)
    await contactPage.nameInput.fill(tagName);
    await contactPage.nameInput.press('Enter');

    // 5. User click "Save Changes" button.
    await contactPage.clickSaveChanges();

    // ===================== Assertion (Expected Result) =====================
    // 1. User successfully edits existing contact data inside /contacts menu
    // 2. The new tag's name is displayed successfully in contact's detail page.
    await expect(contactPage.contactDetailHeading).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(tagName)).toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 38 - Unassign Tag for Existing Contact
  // --------------------------------------------------------------------------
  test('38 - TC 38 - Unassign Tag for Existing Contact @Contacts @P1 @Positive', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has already had existing contact data created inside Contacts Menu.
    // 3. User has already created the new tag's name under /contact/tags menu.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    await createExistingContact(request, accessToken);
    await createExistingTag(request, accessToken, tagName);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User navigate to the existing contact data and click edit icon at action's column.
    await contactPage.clickEditContact(validContact.name);

    // 4. User remove the new tag's name under Tags Section by click cross icon.
    //    (Asumsi: tiap tag yang ditampilkan memiliki cross/remove icon)
    const removeTagIcon = page.getByRole('button', { name: /remove/i }).first();
    await removeTagIcon.click();

    // 5. User click "Save Changes" button.
    await contactPage.clickSaveChanges();

    // ===================== Assertion (Expected Result) =====================
    // 1. User successfully edits existing contact data inside /contacts menu
    // 2. The new tag's name is not displayed in contact's detail page anymore.
    await expect(contactPage.contactDetailHeading).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(tagName)).not.toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 39 - Edit Existing Tag
  // --------------------------------------------------------------------------
  test('39 - TC 39 - Edit Existing Tag @Contacts @P1 @Positive @SmokeTest', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has already had sample of already created tag.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    await createExistingTag(request, accessToken, tagName);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contact/tags menu.
    await tagPage.gotoTags();

    // 3. User navigate to already created tag sample and click pencil/edit icon.
    await tagPage.clickEditTag(tagName);

    // 4. User edit the tag name using another random name inside the modal.
    await tagPage.fillTagName(updatedTagName);

    // 5. User click "Update Tag" inside modal.
    await tagPage.clickUpdateTag();

    // Tunggu tag terupdate di daftar
    await page.waitForTimeout(2000);

    // ===================== Assertion (Expected Result) =====================
    // 1. User successfully edits existing tag's name inside /contact/tags menu.
    // 2. User can view the edited tag name in the list of /contact/tags menu.
    await tagPage.tagRow(tagName).scrollIntoViewIfNeeded();
    await expect(tagPage.tagRow(updatedTagName)).toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 40 - Edit Existing Tag with Already Used Name
  // --------------------------------------------------------------------------
  test('40 - TC 40 - Edit Existing Tag with Already Used Name @Contacts @P1 @Negative', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has predefined existing tag name want to be edited using another existing tag name already.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    await createExistingTag(request, accessToken, tagName);           // tag yang akan diedit
    await createExistingTag(request, accessToken, updatedTagName);    // tag nama yang sudah digunakan (konflik)

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contact/tags menu.
    await tagPage.gotoTags();

    // 3. User navigate to predefined existing tag name and click edit/pencil icon.
    await tagPage.clickEditTag(tagName);

    // 4. User edit the tag name using another existing tag name sample inside the modal.
    await tagPage.fillTagName(updatedTagName);

    // 5. User click "Update Tag" inside modal.
    await tagPage.clickUpdateTag();

    // ===================== Assertion (Expected Result) =====================
    // 1. User cannot edit existing tag name into the system.
    // 2. Alert error written "Request failed with status code 422" will be displayed.
    await expect(page.getByText(MSG_DUPLICATE_422)).toBeVisible({
      timeout: 10000,
    });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 41 - Edit Existing Tag with Empty Name
  // --------------------------------------------------------------------------
  test('41 - TC 41 - Edit Existing Tag with Empty Name @Contacts @P1 @Negative', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has already had sample of already created tag.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    await createExistingTag(request, accessToken, tagName);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contact/tags menu.
    await tagPage.gotoTags();

    // 3. User navigate to predefined existing tag name and click edit/pencil icon.
    await tagPage.clickEditTag(tagName);

    // 4. User edit the tag name using empty value.
    await tagPage.clearTagName();

    // 5. User click "Update Tag" inside modal.
    await tagPage.clickUpdateTag();

    // ===================== Assertion (Expected Result) =====================
    // 1. User cannot edit existing tag with empty tag name.
    // 2. "Update Tag" button is disabled if the field tag name is empty.
    await expect(tagPage.updateTagButton).toBeDisabled({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 42 - Delete Tag
  // --------------------------------------------------------------------------
  test('42 - TC 42 - Delete Tag @Contacts @P1 @Positive @SmokeTest', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has already had sample of existing created tag.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    await createExistingTag(request, accessToken, tagName);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contact/tags menu.
    await tagPage.gotoTags();

    // 3. User navigate to existing created tag and click garbage/delete icon.
    await tagPage.clickDeleteTag(tagName);

    // 4. User click OK on confirmation alert.
    await tagPage.clickConfirmDelete();

    // Tunggu tag hilang dari daftar
    await page.waitForTimeout(2000);

    // ===================== Assertion (Expected Result) =====================
    // 1. User is able to delete already created tag name.
    // 2. The tag name will not be displayed in /contact/tags menu anymore.
    await expect(tagPage.tagRow(tagName)).not.toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 43 - Delete Contact
  // --------------------------------------------------------------------------
  test('43 - TC 43 - Delete Contact @Contacts @P1 @Positive @SmokeTest', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has already had existing contact data created inside Contacts Menu.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    const existingContact = await createExistingContact(request, accessToken);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User navigate to the existing contact data and click eye icon at action's column.
    await contactPage.clickViewContact(existingContact.name);

    // 4. User click "Delete" button.
    await contactPage.clickDelete();

    // Tunggu kontak terhapus dari daftar
    await page.waitForTimeout(2000);

    // ===================== Assertion (Expected Result) =====================
    // 1. User successfully delete existing contact data inside /contacts menu.
    await expect(contactPage.contactRow(existingContact.name)).not.toBeVisible({
      timeout: 10000,
    });
  });

  // --------------------------------------------------------------------------
  // AgentQ Test Case ID 44 - View Contact Details after Contact Deleted
  // --------------------------------------------------------------------------
  test('44 - TC 44 - View Contact Details after Contact Deleted @Contacts @P1 @Edge', async ({
    page,
    request,
  }) => {
    // ===================== Precondition =====================
    // 1. User has been successfully logged in via application using valid credentials. (terpenuhi di beforeEach)
    // 2. User has deleted one specific contact detail in /contacts menu.
    const accessToken = await auth(request, API_BASE_URL, email, password);
    const existingContact = await createExistingContact(request, accessToken);

    // ===================== Steps =====================
    // 1. User visit base url page and do login into homepage dashboard. (terpenuhi di beforeEach)
    // 2. User navigate to /contacts menu.
    await contactPage.gotoContacts();

    // 3. User choose specific one contact detail and click eye icon at action's column.
    await contactPage.clickViewContact(existingContact.name);

    // 4. User click "Delete" button.
    await contactPage.clickDelete();

    // Tunggu konfirmasi hapus selesai
    await page.waitForTimeout(2000);

    // 5. User hit back the Contact Detail URL after delete action.
    await contactPage.gotoContacts();
    await contactPage.clickViewContact(existingContact.name);

    // ===================== Assertion (Expected Result) =====================
    // 1. User is unable to view contact detail already deleted.
    // 2. Alert "Request failed with status code 404" will be displayed.
    await expect(page.getByText(MSG_NOT_FOUND_404)).toBeVisible({
      timeout: 10000,
    });
  });

  test.afterEach(async ({}, testInfo) => {
    const executionTime = Date.now() - testStartTime;
    const errorDetails = testInfo.errors.map((e) => e.message).join('; ');
    const title = testInfo.title ?? 'Unknown test';
    const status = testInfo.status ?? 'unknown';
    await pushTestResultToAgentQ(title, status, executionTime, errorDetails);
  });
});
