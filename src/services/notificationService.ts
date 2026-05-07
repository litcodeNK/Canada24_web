// Web-compatible notification service using browser Notification API

export function playReactionFeedback(): void {
  // No-op on web (no haptics)
}

export async function showNewContentNotification(payload: {
  title: string;
  body: string;
  isBreaking?: boolean;
}): Promise<void> {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'denied') return;

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
  }

  try {
    new Notification(payload.title, { body: payload.body });
  } catch {}
}
