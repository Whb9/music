// src/lib/auth.ts
// Cloudflare Workers edition — uses Web Crypto API instead of Node.js crypto

import type { IncomingMessage } from 'http';
import cookie from 'cookie';

const SESSION_COOKIE = 'hbwlxy_session';
const SECRET = process.env.SESSION_SECRET || 'hbwlxy_default_secret';

// Web Crypto HMAC-SHA256 → hex string
async function hmacSha256Hex(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string): Promise<string> {
  return hmacSha256Hex(password, SECRET);
}

export async function createSessionToken(password: string): Promise<string> {
  return hashPassword(password);
}

export async function verifySession(req: IncomingMessage): Promise<boolean> {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookie.parse(cookieHeader);
  const sessionToken = cookies[SESSION_COOKIE];
  if (!sessionToken) return false;

  const adminPassword = process.env.ADMIN_PASSWORD || 'hbwlxy123';
  const expectedToken = await createSessionToken(adminPassword);
  return sessionToken === expectedToken;
}

export async function getSessionCookie(password: string): Promise<string> {
  const token = await createSessionToken(password);
  return cookie.serialize(SESSION_COOKIE, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });
}

export function clearSessionCookie(): string {
  return cookie.serialize(SESSION_COOKIE, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
}
