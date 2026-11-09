/**
 * Service Worker stub for sw-notifications.js
 * Automatically unregisters any obsolete/cached service workers registered on localhost:3000
 * and skips waiting to prevent 404 routing delays and console errors.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.clients.claim())
      .catch(() => {})
  );
});

self.addEventListener('fetch', (event) => {
  // Let browser handle normal network requests
});

