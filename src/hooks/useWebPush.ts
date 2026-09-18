'use client';

import { useCallback, useEffect, useState } from 'react';
import { disableWebPush, enableWebPush, getExistingPushSubscription, isWebPushSupported } from '@/lib/webPush';

export function useWebPush() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supportedNow = isWebPushSupported();
    setSupported(supportedNow);
    if (!supportedNow) return;
    getExistingPushSubscription().then(sub => {
      setEnabled(Boolean(sub) && Notification.permission === 'granted');
    });
  }, []);

  const toggle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (enabled) {
        await disableWebPush();
        setEnabled(false);
      } else {
        await enableWebPush();
        setEnabled(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  return { supported, enabled, loading, error, toggle };
}
