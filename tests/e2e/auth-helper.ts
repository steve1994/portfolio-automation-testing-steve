import { type APIRequestContext, type Page } from '@playwright/test';
import { auth } from '../../helper/api-helper';

/**
 * Helper autentikasi untuk UI Testing (pendekatan hybrid).
 *
 * Mengikuti pola yang sudah ada di tests/e2e/login-hybrid.spec.ts:
 * 1. Mendapatkan JWT access_token melalui API login (cepat, < 1 detik).
 * 2. Inject token ke localStorage browser.
 * 3. Reload ke halaman home sehingga user langsung ter-autentikasi.
 *
 * Digunakan untuk memenuhi "Precondition" test case AgentQ ID 26-44:
 * "User has been successfully logged in via application using valid credentials."
 */
export async function loginViaAPI(
  request: APIRequestContext,
  email: string,
  password: string,
  baseURL?: string
): Promise<string> {
  const apiBase = baseURL || process.env.API_BASE_URL || 'https://api.emra.chat';
  const token = await auth(request, apiBase, email, password);
  return token;
}

export async function injectTokenAndGotoHome(
  page: Page,
  token: string,
  baseURL?: string
): Promise<void> {
  const appBase = baseURL || process.env.BASE_URL || 'https://www.emra.chat';

  // Buka base URL terlebih dahulu agar localStorage tersedia
  await page.goto(appBase);

  // Inject JWT ke localStorage browser
  await page.evaluate((t) => {
    localStorage.setItem('access_token', t);
  }, token);

  // Reload ke halaman home — user langsung ter-autentikasi
  await page.goto(`${appBase}/home`);
}
