'use client';

import { useEffect, useRef } from 'react';

/**
 * SessionKeepAlive silently maintains the user's session by:
 * 1. Automatically refreshing JWT tokens every 15 minutes while active.
 * 2. Refreshing tokens when user returns to the tab (visibility change).
 * 3. Transparently intercepting 401 Unauthorized API responses, performing a refresh,
 *    and retrying the request so the user is not abruptly logged out.
 */
export function SessionKeepAlive() {
  const isRefreshingRef = useRef(false);
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  const doTokenRefresh = async (): Promise<boolean> => {
    if (isRefreshingRef.current && refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    isRefreshingRef.current = true;
    const p = (async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          return !!data.success;
        }
        return false;
      } catch {
        return false;
      } finally {
        isRefreshingRef.current = false;
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = p;
    return p;
  };

  useEffect(() => {
    // 1. Proactive interval: Refresh every 15 minutes (900,000 ms)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        doTokenRefresh();
      }
    }, 15 * 60 * 1000);

    // 2. Refresh on window focus or visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        doTokenRefresh();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // 3. Global Fetch Interceptor for seamless 401 retry
    const originalFetch = window.fetch;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      const response = await originalFetch(input, init);

      const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const isAuthEndpoint =
        urlString.includes('/api/auth/login') ||
        urlString.includes('/api/auth/refresh') ||
        urlString.includes('/api/auth/logout') ||
        urlString.includes('/api/auth/register');

      // If an API request received a 401 and isn't an auth endpoint, attempt silent refresh & retry once
      if (response.status === 401 && !isAuthEndpoint && urlString.includes('/api/')) {
        const refreshed = await doTokenRefresh();
        if (refreshed) {
          // Retry original request
          return originalFetch(input, init);
        }
      }

      return response;
    };

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
