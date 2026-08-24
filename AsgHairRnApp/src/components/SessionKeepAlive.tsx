import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getAuthToken, refreshAuthToken } from '../utils/apiClient';

/**
 * SessionKeepAlive silently maintains the user's session in ASG Hair React Native App:
 * 1. Proactively refreshes JWT tokens every 15 minutes when the app is active.
 * 2. Automatically triggers a silent refresh when the app returns to the foreground.
 */
export function SessionKeepAlive() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // 1. Proactive interval: Refresh every 15 minutes (900,000 ms) while app is active
    const interval = setInterval(async () => {
      if (AppState.currentState === 'active') {
        const token = await getAuthToken();
        if (token) {
          await refreshAuthToken();
        }
      }
    }, 15 * 60 * 1000);

    // 2. Refresh when app transitions back to foreground
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const token = await getAuthToken();
        if (token) {
          await refreshAuthToken();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  return null;
}

export default SessionKeepAlive;
