import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/apiConfig';

export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Retrieve the active access token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Retrieve the refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Save auth and refresh tokens to persistent storage
 */
export async function saveAuthTokens(token: string, refreshToken?: string): Promise<void> {
  try {
    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    if (refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (e) {
    console.error('Error saving auth tokens:', e);
  }
}

/**
 * Clear stored authentication tokens
 */
export async function clearAuthTokens(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (e) {
    console.error('Error clearing auth tokens:', e);
  }
}

let isRefreshing = false;
let refreshSubscribers: ((newToken: string | null) => void)[] = [];

function onTokenRefreshed(newToken: string | null) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

/**
 * Calls the backend /api/auth/refresh to exchange an expired/active token or refresh token for a new token
 */
export async function refreshAuthToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshSubscribers.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const currentToken = await getAuthToken();
    const refreshToken = await getRefreshToken();

    if (!currentToken && !refreshToken) {
      isRefreshing = false;
      onTokenRefreshed(null);
      return null;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (currentToken) {
      headers['Cookie'] = `graftdesk_session=${currentToken}`;
      headers['Authorization'] = `Bearer ${currentToken}`;
    }
    if (refreshToken) {
      headers['x-refresh-token'] = refreshToken;
    }

    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        token: currentToken,
        refreshToken: refreshToken,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.token) {
        await saveAuthTokens(data.token, data.refreshToken);
        isRefreshing = false;
        onTokenRefreshed(data.token);
        return data.token;
      }
    }

    // Refresh failed or unauthorized
    isRefreshing = false;
    onTokenRefreshed(null);
    return null;
  } catch (err) {
    console.error('refreshAuthToken failed:', err);
    isRefreshing = false;
    onTokenRefreshed(null);
    return null;
  }
}

/**
 * Fetch wrapper with automatic Authorization / Cookie headers and seamless 401 retry with token refresh
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    if (!headers['Cookie']) {
      headers['Cookie'] = `graftdesk_session=${token}`;
    }
    if (!headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401 Unauthorized, attempt a refresh and retry once
  if (response.status === 401) {
    const newToken = await refreshAuthToken();
    if (newToken) {
      const retryHeaders: Record<string, string> = {
        ...headers,
        Cookie: `graftdesk_session=${newToken}`,
        Authorization: `Bearer ${newToken}`,
      };

      response = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });
    }
  }

  return response;
}
