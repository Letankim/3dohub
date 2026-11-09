/**
 * Anonymous Device / Client Session Manager for 3DoHub.
 * Stores client session ID in localStorage and cookies.
 * Keeps local history of links created on this device to guarantee privacy isolation.
 */

const CLIENT_SESSION_KEY = '3dohub_client_session_id';
const CREATED_LINKS_KEY = '3dohub_device_created_link_codes';

export function getClientSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(CLIENT_SESSION_KEY);
    if (!id || !id.startsWith('csess_')) {
      const randomBytes = new Uint8Array(16);
      crypto.getRandomValues(randomBytes);
      id =
        'csess_' +
        Array.from(randomBytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      localStorage.setItem(CLIENT_SESSION_KEY, id);
      document.cookie = `${CLIENT_SESSION_KEY}=${id}; path=/; max-age=31536000; SameSite=Lax`;
    }
    return id;
  } catch {
    return 'csess_fallback_' + Date.now();
  }
}

export function getDeviceCreatedLinkCodes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CREATED_LINKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } else {
      // Seed existing initial test link so current device continues to see it
      const initial = ['nCGjWU'];
      localStorage.setItem(CREATED_LINKS_KEY, JSON.stringify(initial));
      return initial;
    }
  } catch {
    // ignore
  }
  return ['nCGjWU'];
}

export function recordCreatedLinkCode(code: string): void {
  if (typeof window === 'undefined' || !code) return;
  try {
    const current = getDeviceCreatedLinkCodes();
    if (!current.includes(code)) {
      current.unshift(code);
      localStorage.setItem(CREATED_LINKS_KEY, JSON.stringify(current.slice(0, 500)));
    }
  } catch {
    // ignore
  }
}

export function removeDeviceCreatedLinkCode(code: string): void {
  if (typeof window === 'undefined' || !code) return;
  try {
    const current = getDeviceCreatedLinkCodes().filter((c) => c !== code);
    localStorage.setItem(CREATED_LINKS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

