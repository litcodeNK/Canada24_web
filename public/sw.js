self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: 'Canada 24/7', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Canada 24/7';
  const options = {
    body: payload.body || '',
    icon: '/canada247-logo.png',
    badge: '/canada247-logo.png',
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const articleId = event.notification.data?.article_id;
  const url = articleId ? `/article/${articleId}` : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
