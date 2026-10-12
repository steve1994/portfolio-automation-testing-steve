import { APIRequestContext, expect } from "@playwright/test";

export async function auth(
  request: APIRequestContext,
  baseURL: string,
  email: string,
  password: string
): Promise<string> {
  const response = await request.post(`${baseURL}/api/v1/auth/login`, {
    data: { auth: { email, password } },
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
  });

  if (response.status() !== 200) {
    throw new Error(`Login failed: ${response.status()}`);
  }

  const body = await response.json();
  return body.data.tokens.access_token; // Return JWT string
}

export async function getCurrentUser(request: APIRequestContext, baseURL: string, accessToken: string ): Promise<string> {
  const response = await request.get(`${baseURL}/api/v1/user`, {
    headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}` 
    }
  });
  const body = await response.json();
  expect(response.status()).toBe(200);
  
  return body
}