import { auth } from '../../helper/api-helper';
import userData from '../../data/user.json' with { type: 'json'};
import { test, expect } from '@playwright/test';

test('Bypass Login UI, langsung test halaman Dashboard', async ({ page, request }) => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';

  // Step 1: Ambil token via API (cepat! < 1 detik)
  const token = await auth(
    request, baseURL,
    userData.valid_user_staging.email,
    userData.valid_user_staging.password
  );

  console.log(token)

  // Step 2: Inject JWT ke localStorage browser
  await page.goto(process.env.BASE_URL);
  await page.evaluate((t) => {
    localStorage.setItem('access_token', t);
  }, token);

  // Step 3: Reload — user langsung ter-autentikasi!
  await page.goto(process.env.BASE_URL + `/home`);
});