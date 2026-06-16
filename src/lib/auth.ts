// src/lib/auth.ts
// EdgeOne edition — delegates auth to Edge Functions API

import type { IncomingMessage } from 'http';

function apiBase(req?: IncomingMessage): string {
  if (req) {
    const host = req.headers.host || 'localhost:3000';
    const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
    return `${proto}://${host}`;
  }
  return '';
}

export async function verifySession(req: IncomingMessage): Promise<boolean> {
  const base = apiBase(req);

  // Forward the cookie from the incoming request
  const cookieHeader = req.headers.cookie || '';

  const res = await fetch(`${base}/api/auth/check`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
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
