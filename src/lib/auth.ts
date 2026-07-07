// src/lib/auth.ts
// EdgeOne edition — delegates auth to Edge Functions API

// verifySession is called from getServerSideProps. On EdgeOne, SSR cannot
// self-fetch edge functions, so we return false (not authenticated) server-side.
// The admin page uses a client-side useEffect to re-check auth after mount.
export async function verifySession(_req?: unknown): Promise<boolean> {
  // Server-side (SSR): self-referential HTTP fetch may fail on EdgeOne.
  // Default to not authenticated; client-side JS will handle login state.
  if (typeof window === 'undefined') {
    return false;
  }

  // Client-side: verify via Edge Functions API
  const res = await fetch('/api/auth/check', {
    credentials: 'include',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.authenticated === true;
}

// Client-side login (called from browser)
export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password }),
  });
  return res.json();
}

// Client-side logout
export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export function clearSessionCookie(): string {
  return 'hbwlxy_session=; HttpOnly; Path=/; Max-Age=0';
}
