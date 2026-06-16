// src/lib/data.ts
// EdgeOne edition — fetches from Edge Functions API (same domain, no CORS)

import type { SiteData } from '@/types';

// Base URL for API calls. In getServerSideProps, constructed from request headers.
// In client-side code, uses relative URL (same domain).
function apiBase(): string {
  if (typeof window !== 'undefined') {
    return ''; // Browser: relative URL
  }
  return process.env.SITE_URL || 'http://localhost:3000';
}

export async function readSiteData(req?: { headers: Record<string, string | string[] | undefined> }): Promise<SiteData> {
  let base = apiBase();

  // In SSR context, construct full URL from request headers
  if (req) {
    const host = (req.headers.host as string) || 'localhost:3000';
    const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
    base = `${proto}://${host}`;
  }

  const res = await fetch(`${base}/api/site`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function writeSiteData(data: SiteData, password?: string): Promise<void> {
  const base = apiBase();

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  // Include credentials (cookies) for auth
  const res = await fetch(`${base}/api/site`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
}
