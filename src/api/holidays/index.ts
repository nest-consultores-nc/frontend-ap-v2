import { getBaseUrl } from "../auth/index";

export const fetchFromApi = async <T>(
  path: string,
  token: string,
  method: 'GET' | 'POST' | 'PATCH' = 'GET',
  body?: any
): Promise<T> => {
  const url = `${getBaseUrl()}/${path}`;

  console.log(url);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: method === 'POST' || method === 'PATCH' ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error(`Error fetching from ${path}: ${error.message}`);
    throw error;
  }
};
