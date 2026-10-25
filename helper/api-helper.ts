import { APIRequestContext, APIResponse, expect } from "@playwright/test";

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

// ===================== Contacts =====================

export async function getContacts(request: APIRequestContext, baseURL: string, accessToken: string ): Promise<APIResponse> {
  const response = await request.get(`${baseURL}/api/v1/contacts`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function createContact(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  payload: Record<string, unknown>
): Promise<APIResponse> {
  const response = await request.post(`${baseURL}/api/v1/contacts`, {
    data: payload,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function getContactDetail(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  userId: string
): Promise<APIResponse> {
  const response = await request.get(`${baseURL}/api/v1/contacts/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function updateContact(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  userId: string,
  payload: Record<string, unknown>
): Promise<APIResponse> {
  const response = await request.patch(`${baseURL}/api/v1/contacts/${userId}`, {
    data: payload,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function deleteContact(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  userId: string
): Promise<APIResponse> {
  const response = await request.delete(`${baseURL}/api/v1/contacts/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function assignTagToContact(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  userId: string,
  tagNames: string[]
): Promise<APIResponse> {
  const response = await request.post(`${baseURL}/api/v1/contacts/${userId}/add_tags`, {
    data: { tag_names: tagNames },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function unassignTagFromContact(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  userId: string,
  tagId: string | number
): Promise<APIResponse> {
  const response = await request.delete(`${baseURL}/api/v1/contacts/${userId}/remove_tag`, {
    params: { tag_id: tagId },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

// ===================== Tags =====================

export async function getTags(request: APIRequestContext, baseURL: string, accessToken: string ): Promise<APIResponse> {
  const response = await request.get(`${baseURL}/api/v1/tags`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function getSystemTagId(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string
): Promise<string | number> {
  const response = await getTags(request, baseURL, accessToken);
  expect(response.status()).toBe(200);
  const body = await response.json();
  const tags: Array<{ id: string | number; system_tag?: boolean; name?: string }> =
    body.data?.tags || [];
  const systemTag = tags.find((tag) => tag.system_tag);
  if (!systemTag) {
    throw new Error(
      `No system tag found in tags list. Sample tags: ${JSON.stringify(
        tags.slice(0, 5).map((t) => ({ id: t.id, name: t.name, system_tag: t.system_tag }))
      )}`
    );
  }
  return systemTag.id;
}

export async function getNonsystemTagBody(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string
): Promise<{ tag: { name: string; color: string } }> {
  const response = await getTags(request, baseURL, accessToken);
  expect(response.status()).toBe(200);
  const body = await response.json();
  const tags: Array<{
    id: string | number;
    system_tag?: boolean;
    name?: string;
    color?: string;
  }> = body.data?.tags || [];
  const nonSystemTag = tags.find((tag) => tag.system_tag === false);
  if (!nonSystemTag) {
    throw new Error(
      `No non-system tag found in tags list. Sample tags: ${JSON.stringify(
        tags.slice(0, 5).map((t) => ({ id: t.id, name: t.name, system_tag: t.system_tag }))
      )}`
    );
  }
  return { tag: { name: nonSystemTag.name ?? '', color: nonSystemTag.color ?? '' } };
}

export async function getTagDetail(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  tagId: string | number
): Promise<APIResponse> {
  const response = await request.get(`${baseURL}/api/v1/tags/${tagId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function createTag(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  payload: Record<string, unknown>
): Promise<APIResponse> {
  const response = await request.post(`${baseURL}/api/v1/tags`, {
    data: payload,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function updateTag(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  tagId: string | number,
  payload: Record<string, unknown>
): Promise<APIResponse> {
  const response = await request.patch(`${baseURL}/api/v1/tags/${tagId}`, {
    data: payload,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function deleteTag(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  tagId: string | number
): Promise<APIResponse> {
  const response = await request.delete(`${baseURL}/api/v1/tags/${tagId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function getPopularTags(request: APIRequestContext, baseURL: string, accessToken: string ): Promise<APIResponse> {
  const response = await request.get(`${baseURL}/api/v1/tags/popular`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

export async function getSuggestionTags(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  query: string
): Promise<APIResponse> {
  const response = await request.get(`${baseURL}/api/v1/tags/suggestions`, {
    params: { q: query },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response;
}

// ===================== Create helpers - return created entity id =====================

export async function createContactAndGetUserId(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  payload: Record<string, unknown>
): Promise<string> {
  const response = await createContact(request, baseURL, accessToken, payload);
  expect(response.status()).toBe(201);
  const body = await response.json();
  return body.data.contact.id;
}

export async function createTagAndGetId(
  request: APIRequestContext,
  baseURL: string,
  accessToken: string,
  payload: Record<string, unknown>
): Promise<string | number> {
  const response = await createTag(request, baseURL, accessToken, payload);
  expect(response.status()).toBe(201);
  const body = await response.json();
  return body.data.tag.id;
}
