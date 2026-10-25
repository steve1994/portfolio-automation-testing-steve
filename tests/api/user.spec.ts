import { test, expect } from '@playwright/test';
import dataTest from '../../data/user.json' with { type: 'json' };
import { auth, getCurrentUser } from '../../helper/api-helper';
import userSchema from '../../json-schema/user-json-schema.json'  with { type: 'json' };
import { Validator } from 'jsonschema';

test('User successfully get current user', async ({ request }) => {

  // Precondition
  const baseURL = process.env.API_BASE_URL || 'https://api.emra.chat';
  const email = dataTest.valid_user_staging.email
  const password = dataTest.valid_user_staging.password

  const access_token = await auth(request, baseURL, email, password)

  console.log(access_token)
  const response = await getCurrentUser(request, baseURL, access_token)

  console.log(await response)

  const validator = new Validator();
  const result = validator.validate(response, userSchema);
  expect(result.errors).toHaveLength(0);
});