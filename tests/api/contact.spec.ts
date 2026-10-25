import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import dataTest from '../../data/user.json' with { type: 'json' };
import {
  auth,
  getContacts,
  createContact,
  getContactDetail,
  updateContact,
  deleteContact,
  assignTagToContact,
  unassignTagFromContact,
  getTags,
  getTagDetail,
  createTag,
  updateTag,
  deleteTag,
  getPopularTags,
  getSuggestionTags,
  createContactAndGetUserId,
  createTagAndGetId,
  getSystemTagId,
  getNonsystemTagBody,
} from '../../helper/api-helper';
import contactsListSchema from '../../json-schema/contacts-list-json-schema.json' with { type: 'json' };
import contactSchema from '../../json-schema/contact-json-schema.json' with { type: 'json' };
import tagsListSchema from '../../json-schema/tags-list-json-schema.json' with { type: 'json' };
import tagSchema from '../../json-schema/tag-json-schema.json' with { type: 'json' };
import { Validator } from 'jsonschema';

const baseURL = process.env.API_BASE_URL || 'https://api.emra.chat';

test.describe('US-06 Manage Contacts API Testing', () => {
  let accessToken: string;

  const email = dataTest.valid_user_staging.email;
  const password = dataTest.valid_user_staging.password;

  const createContactBody = {
    contact: {
      name: 'Jane Doe',
      phone: '+628555123456',
      email: 'jane@example.com',
      active: true,
      tags: ['prospek', 'hot'],
      metadata: {},
    },
  };

  const updateContactBody = {
    contact: {
      name: 'Jane Updated',
      phones: [
        { id: 3, phone_number: '+628555123456', phone_type: 'mobile', is_primary: true, source: 'manual' },
        { phone_number: '+628555999999', phone_type: 'mobile', is_primary: false, source: 'manual' },
      ],
      emails: [
        { id: 3, email: 'jane.updated@example.com', email_type: 'personal', is_primary: true, source: 'manual' },
      ],
      tags: ['prospek', 'hot'],
    },
  };

  const createTagBody = {
    tag: {
      name: `Premium Client ${faker.string.alphanumeric(6)}`,
      color: '#FFD700',
    },
  };

  test.beforeEach(async ({ request }) => {
    accessToken = await auth(request, baseURL, email, password);
  });

  // ============================================================
  // AgentQ Test Case ID 1 - Get List of Contacts
  // ============================================================
  test('1 - TC 01 - Get List of Contacts @Contacts @P0 @Positive', async ({ request }) => {
    // Steps:
    //   1. User has been successfully authenticated using login credentials.
    //   2. User has already had contact's data imported from WhatsApp.

    // Endpoint: GET /api/v1/contacts
    // Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    const response = await getContacts(request, baseURL, accessToken);

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactsListSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 2 - Get List of Contacts without Authentication
  // ============================================================
  test('2 - TC 02 - Get List of Contacts without Authentication @Contacts @P1 @Negative', async ({ request }) => {
    // Steps:
    //   Endpoint: GET /api/v1/contacts
    //   Request Headers: Content-Type: application/json;

    const response = await request.get(`${baseURL}/api/v1/contacts`, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    });

    // Expected Result: Status Code 401
    expect(response.status()).toBe(401);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 3 - Create New Contact with Valid Request's Data
  // ============================================================
  test('3 - TC 03 - Create New Contact with Valid Request\'s Data @Contacts @P0 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: POST /api/v1/contacts
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>
    //   Request Body: { contact: { name: "Jane Doe", phone: "+628555123456", email: "jane@example.com", active: true, tags: ["prospek", "hot"], metadata: {} } }

    const response = await createContact(request, baseURL, accessToken, {
      contact: { ...createContactBody.contact, email: `jane.${Date.now()}@example.com` },
    });

    // Expected Result: Status Code 201
    expect(response.status()).toBe(201);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 4 - Create New Contact with Empty Name and/or Empty Phone Number
  // ============================================================
  test('4 - TC 04 - Create New Contact with Empty Name and/or Empty Phone Number @Contacts @P1 @Negative', async ({ request }) => {
    // Steps:
    //   Endpoint: POST /api/v1/contacts
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>
    //   Request Body: { contact: { name: "", phone: "", email: "jane@example.com", active: true, tags: ["prospek", "hot"], metadata: {} } }

    const response = await createContact(request, baseURL, accessToken, {
      contact: {
        name: '',
        phone: '',
        email: 'jane@example.com',
        active: true,
        tags: ['prospek', 'hot'],
        metadata: {},
      },
    });

    // Expected Result: Status Code 422
    expect(response.status()).toBe(422);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 5 - Create New Contact with Invalid Phone Number
  // ============================================================
  test('5 - TC 05 - Create New Contact with Invalid Phone Number @Contacts @P1 @Negative', async ({ request }) => {
    // Steps:
    //   Endpoint: POST /api/v1/contacts
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>
    //   Request Body: { contact: { name: "Jane Doe", phone: "fsdafasfdasfadsfsd", email: "jane@example.com", active: true, tags: ["prospek", "hot"], metadata: {} } }

    const response = await createContact(request, baseURL, accessToken, {
      contact: {
        name: 'Jane Doe',
        phone: 'fsdafasfdasfadsfsd',
        email: 'jane@example.com',
        active: true,
        tags: ['prospek', 'hot'],
        metadata: {},
      },
    });

    // Expected Result: Status Code 422
    expect(response.status()).toBe(422);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 6 - Get Contact Detail with Valid User ID
  // ============================================================
  test('6 - TC 06 - Get Contact Detail with Valid User ID @Contacts @P0 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: GET /api/v1/contacts/:user_id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    // Create fresh contact to get :user_id for this test case
    const userId = await createContactAndGetUserId(request, baseURL, accessToken, {
      contact: { ...createContactBody.contact, email: `jane.${Date.now()}@example.com` },
    });

    // :user_id is taken from newly created contact above
    const response = await getContactDetail(request, baseURL, accessToken, userId);

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 7 - Get Contact Detail with No-Existed User ID
  // ============================================================
  test('7 - TC 07 - Get Contact Detail with No-Existed User ID @Contacts @P1 @Negative', async ({ request }) => {
    // Steps:
    //   Endpoint: GET /api/v1/contacts/:user_id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    // Random :user_id generated with faker because this test case is tagged as negative
    const nonExistedUserId = faker.string.uuid();

    const response = await getContactDetail(request, baseURL, accessToken, nonExistedUserId);

    // Expected Result: Status Code 404
    expect(response.status()).toBe(404);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 8 - Update Existing Contact with Valid User ID
  // ============================================================
  test('8 - TC 08 - Update Existing Contact with Valid User ID @Contacts @P0 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: PATCH /api/v1/contacts/:id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>
    //   Request Body: { contact: { name: "Jane Updated", phones: [...], emails: [...], tags: ["prospek", "hot"] } }

    // Create fresh contact to get :user_id for this test case
    const userId = await createContactAndGetUserId(request, baseURL, accessToken, {
      contact: { ...createContactBody.contact, email: `jane.${Date.now()}@example.com` },
    });

    // :user_id is taken from newly created contact above
    const response = await updateContact(request, baseURL, accessToken, userId, updateContactBody);

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 9 - Update Existing Contact with No-Existed User ID
  // ============================================================
  test('9 - TC 09 - Update Existing Contact with No-Existed User ID @Contacts @P1 @Negative', async ({ request }) => {
    // Steps:
    //   Endpoint: PATCH /api/v1/contacts/:id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>
    //   Request Body: { contact: { name: "Jane Updated", phones: [...], emails: [...], tags: ["prospek", "hot"] } }

    // Random :user_id generated with faker because this test case is tagged as negative
    const nonExistedUserId = faker.string.uuid();

    const response = await updateContact(request, baseURL, accessToken, nonExistedUserId, updateContactBody);

    // Expected Result: Status Code 404
    expect(response.status()).toBe(404);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 10 - Get List of Tags
  // ============================================================
  test('10 - TC 10 - Get List of Tags @Contacts @P1 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: GET /api/v1/tags
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    const response = await getTags(request, baseURL, accessToken);

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema tag list response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, tagsListSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 11 - Get Detail of Tag from Valid Tag ID
  // ============================================================
  test('11 - TC 11 - Get Detail of Tag from Valid Tag ID @Contacts @P1 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: GET /api/v1/tags/:tag_id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    // Create fresh tag to get :tag_id for this test case
    const tagId = await createTagAndGetId(request, baseURL, accessToken, {
      tag: { ...createTagBody.tag, name: `Premium Client ${faker.string.alphanumeric(6)}` },
    });

    // :tag_id is taken from newly created tag above
    const response = await getTagDetail(request, baseURL, accessToken, tagId);

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema tag response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, tagSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 12 - Get Detail of Tag from Not-Existed Tag ID
  // ============================================================
  test('12 - TC 12 - Get Detail of Tag from Not-Existed Tag ID @Contacts @P2 @Negative', async ({ request }) => {
    // Steps:
    //   Endpoint: GET /api/v1/tags/:tag_id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    // Random :tag_id generated with faker because this test case is tagged as negative
    const nonExistedTagId = faker.number.int({ min: 1, max: 100000 });

    const response = await getTagDetail(request, baseURL, accessToken, nonExistedTagId);

    // Expected Result: Status Code 404
    expect(response.status()).toBe(404);

    // Validator: json-schema tag response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, tagSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 13 - Create New Tags
  // ============================================================
  test('13 - TC 13 - Create New Tags @Contacts @P1 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: POST /api/v1/tags
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>
    //   Request Body: { tag: { name: "Premium Client", color: "#FFD700" } }

    const response = await createTag(request, baseURL, accessToken, createTagBody);

    // Expected Result: Status Code 201
    expect(response.status()).toBe(201);

    // Validator: json-schema tag response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, tagSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 14 - Create New Tags with Already Existing Name
  // ============================================================
  test('14 - TC 14 - Create New Tags with Already Existing Name @Contacts @P1 @Negative', async ({ request }) => {
    // Steps:
    //   Endpoint: POST /api/v1/tags
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>
    //   Request Body: { tag: { name: "Premium Client", color: "#FFD700" } }

    // Take sample non-system tag body via helper (existing tag => expect 422 duplicate)
    const tagBody = await getNonsystemTagBody(request, baseURL, accessToken);

    const response = await createTag(request, baseURL, accessToken, tagBody);

    // Expected Result: Status Code 422
    expect(response.status()).toBe(422);

    // Validator: json-schema tag response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, tagSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 15 - Update Existing Tag
  // ============================================================
  test('15 - TC 15 - Update Existing Tag @Contacts @P1 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: PATCH /api/v1/tags/:tag_id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>
    //   Request Body: { tag: { name: "Premium Customer", color: "#FFC700" } }

    // Create fresh tag to get :tag_id for this test case
    const tagId = await createTagAndGetId(request, baseURL, accessToken, {
      tag: { ...createTagBody.tag, name: `Premium Customer ${faker.string.alphanumeric(6)}` },
    });

    // :tag_id is taken from newly created tag above
    const response = await updateTag(request, baseURL, accessToken, tagId, {
      tag: { name: `Premium Customer ${faker.string.alphanumeric(6)}`, color: '#FFC700' },
    });

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema tag response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, tagSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 16 - Update System Tag
  // ============================================================
  test('16 - TC 16 - Update System Tag @Contacts @P1 @Edge', async ({ request }) => {
    // Steps:
    //   Endpoint: PATCH /api/v1/tags/:tag_id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>
    //   Request Body: { tag: { name: "Premium Client", color: "#FFD700" } }

    // :tag_id taken from existing system tag via getSystemTagId
    const tagId = await getSystemTagId(request, baseURL, accessToken);

    const response = await updateTag(request, baseURL, accessToken, tagId, {
      tag: { name: 'Premium Client', color: '#FFD700' },
    });

    // Expected Result: Status Code 403
    expect(response.status()).toBe(403);

    // Validator: json-schema tag response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, tagSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 17 - Get Popular Tags
  // ============================================================
  test('17 - TC 17 - Get Popular Tags @Contacts @P2 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: GET /api/v1/tags/popular
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    const response = await getPopularTags(request, baseURL, accessToken);

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema tag list response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, tagsListSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 18 - Get Suggestion Tags
  // ============================================================
  test('18 - TC 18 - Get Suggestion Tags @Contacts @P2 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: GET /api/v1/tags/suggestions?q=vip
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    const response = await getSuggestionTags(request, baseURL, accessToken, 'vip');

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema tag list response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, tagsListSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 19 - Assign Tag Into Contact
  // ============================================================
  test('19 - TC 19 - Assign Tag Into Contact @Contacts @P1 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: POST /api/v1/contacts/:user_id/add_tags
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>
    //   Request Body: { tag_names: ["VIP", "Customer"] }

    // Create fresh contact to get :user_id for this test case
    const userId = await createContactAndGetUserId(request, baseURL, accessToken, {
      contact: { ...createContactBody.contact, email: `jane.${Date.now()}@example.com` },
    });

    // :user_id is taken from newly created contact above
    const response = await assignTagToContact(request, baseURL, accessToken, userId, ['VIP', 'Customer']);

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 20 - Unassign Tag from Contact
  // ============================================================
  test('20 - TC 20 - Unassign Tag from Contact @Contacts @P1 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: DELETE /api/v1/contacts/:user_id/remove_tag?tag_id=2
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    // Create fresh contact and tag to get :user_id and :tag_id for this test case
    const userId = await createContactAndGetUserId(request, baseURL, accessToken, {
      contact: { ...createContactBody.contact, email: `jane.${Date.now()}@example.com` },
    });
    const tagId = await createTagAndGetId(request, baseURL, accessToken, {
      tag: { ...createTagBody.tag, name: `VIP Tag ${faker.string.alphanumeric(6)}` },
    });

    // :user_id / :tag_id taken from newly created contact/tag above
    const response = await unassignTagFromContact(request, baseURL, accessToken, userId, tagId);

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 21 - Unassign Un-existed Tag from Contact
  // ============================================================
  test('21 - TC 21 - Unassign Un-existed Tag from Contact @Contacts @P1 @Negative', async ({ request }) => {
    // Steps:
    //   Endpoint: DELETE /api/v1/contacts/:user_id/remove_tag?tag_id=2
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    // Create fresh contact to get :user_id for this test case
    const userId = await createContactAndGetUserId(request, baseURL, accessToken, {
      contact: { ...createContactBody.contact, email: `jane.${Date.now()}@example.com` },
    });

    // Random :tag_id generated with faker because this test case is tagged as negative
    const nonExistedTagId = faker.number.int({ min: 1, max: 100000 });

    const response = await unassignTagFromContact(request, baseURL, accessToken, userId, nonExistedTagId);

    // Expected Result: Status Code 404
    expect(response.status()).toBe(404);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 22 - Deactivate/Delete Existing Tag
  // ============================================================
  test('22 - TC 22 - Deactivate/Delete Existing Tag @Contacts @P1 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: DELETE /api/v1/tags/:tag_id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    // Create fresh tag to get :tag_id for this test case
    const tagId = await createTagAndGetId(request, baseURL, accessToken, {
      tag: { ...createTagBody.tag, name: `Delete Tag ${faker.string.alphanumeric(6)}` },
    });

    // :tag_id is taken from newly created tag above
    const response = await deleteTag(request, baseURL, accessToken, tagId);

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema tag response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, tagSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 23 - Deactivate/Delete System Tag
  // ============================================================
  test('23 - TC 23 - Deactivate/Delete System Tag @Contacts @P1 @Edge', async ({ request }) => {
    // Steps:
    //   Endpoint: DELETE /api/v1/tags/:tag_id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    // :tag_id taken from existing system tag via getSystemTagId
    const tagId = await getSystemTagId(request, baseURL, accessToken);

    const response = await deleteTag(request, baseURL, accessToken, tagId);

    // Expected Result: Status Code 403
    expect(response.status()).toBe(403);

    // Validator: json-schema tag response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, tagSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 24 - Delete Existing Contact
  // ============================================================
  test('24 - TC 24 - Delete Existing Contact @Contacts @P0 @Positive', async ({ request }) => {
    // Steps:
    //   Endpoint: DELETE /api/v1/contacts/:user_id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    // Create fresh contact to get :user_id for this test case
    const userId = await createContactAndGetUserId(request, baseURL, accessToken, {
      contact: { ...createContactBody.contact, email: `jane.${Date.now()}@example.com` },
    });

    // :user_id is taken from newly created contact above
    const response = await deleteContact(request, baseURL, accessToken, userId);

    // Expected Result: Status Code 200
    expect(response.status()).toBe(200);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });

  // ============================================================
  // AgentQ Test Case ID 25 - Delete Non-Existing Contact
  // ============================================================
  test('25 - TC 25 - Delete Non-Existing Contact @Contacts @P1 @Negative', async ({ request }) => {
    // Steps:
    //   Endpoint: DELETE /api/v1/contacts/:user_id
    //   Request Headers: Content-Type: application/json; Authorization: Bearer <token>

    // Random :user_id generated with faker because this test case is tagged as negative
    const nonExistedUserId = faker.string.uuid();

    const response = await deleteContact(request, baseURL, accessToken, nonExistedUserId);

    // Expected Result: Status Code 404
    expect(response.status()).toBe(404);

    // Validator: json-schema contact response body
    const body = await response.json();
    const validator = new Validator();
    const result = validator.validate(body, contactSchema);
    expect(result.errors).toHaveLength(0);
  });
});
