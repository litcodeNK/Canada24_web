import { apiRequest } from '@/services/api';
import { readStoredSession, requestWithStoredSession } from '@/services/sessionService';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isWebPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

/** Anonymous visitors can subscribe too (the backend upserts by endpoint and
 * re-attaches the row to a real account if this same browser subscribes
 * again after signing in), so this only adds an auth header when signed in
 * rather than requiring a session. */
async function syncSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  const session = readStoredSession();
  const body = JSON.stringify(subscription.toJSON());
  if (session) {
    await requestWithStoredSession(session, '/notifications/web-push/subscribe/', { method: 'POST', body });
  } else {
    await apiRequest('/notifications/web-push/subscribe/', { method: 'POST', body });
  }
}

export async function enableWebPush(): Promise<PushSubscription> {
  if (!isWebPushSupported()) {
    throw new Error('Push notifications are not supported in this browser.');
  }

  if (Notification.permission === 'denied') {
    throw new Error(
      'Notifications are blocked for this site. Click the icon left of the address bar (or open your browser\'s site settings) and set Notifications to "Allow", then try again.',
    );
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const { public_key } = await apiRequest<{ public_key: string }>('/notifications/web-push/vapid-public-key/');

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(public_key) as BufferSource,
    });
  }

  await syncSubscriptionToServer(subscription);
  return subscription;
}

export async function disableWebPush(): Promise<void> {
  if (!isWebPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();

  const session = readStoredSession();
  const body = JSON.stringify({ endpoint });
  if (session) {
    await requestWithStoredSession(session, '/notifications/web-push/subscribe/', { method: 'DELETE', body });
  } else {
    await apiRequest('/notifications/web-push/subscribe/', { method: 'DELETE', body });
  }
}

/**
 * Re-syncs an already-granted subscription on app load without prompting —
 * covers the case where the browser rotated the subscription's endpoint/keys.
 * Runs for anonymous visitors too (not just signed-in ones): the resulting
 * subscribe call omits the auth header when there's no session, same as
 * enableWebPush.
 */
export async function resyncWebPushIfGranted(): Promise<void> {
  if (!isWebPushSupported()) return;
  if (Notification.permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const { public_key } = await apiRequest<{ public_key: string }>('/notifications/web-push/vapid-public-key/');
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(public_key) as BufferSource,
      });
    }

    await syncSubscriptionToServer(subscription);
  } catch {
    // Best-effort background resync — a failure here shouldn't disrupt app load.
  }
}
