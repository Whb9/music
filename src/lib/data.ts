// src/lib/data.ts
// EdgeOne edition — fetches from Edge Functions API. Falls back to local JSON in dev.

import type { SiteData } from '@/types';
import fs from 'fs';
import path from 'path';

const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'site.json');

function apiBase(): string {
  if (typeof window !== 'undefined') {
    return ''; // Browser: relative URL
  }
  return process.env.SITE_URL || 'http://localhost:3000';
}

function isLocalDev(req?: { headers: Record<string, string | string[] | undefined> }): boolean {
  if (req) {
    const host = (req.headers.host as string) || '';
    return host.includes('localhost') || host.includes('127.0.0.1');
  }
  return typeof window === 'undefined' && !process.env.SITE_URL;
}

export async function readSiteData(req?: { headers: Record<string, string | string[] | undefined> }): Promise<SiteData> {
  // Local dev: read directly from file (no Edge Functions available)
  if (isLocalDev(req)) {
    try {
      const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      return JSON.parse(raw) as SiteData;
    } catch {
      throw new Error('无法读取数据文件 data/site.json');
    }
  }

  // Production: fetch from Edge Functions API (same domain, no CORS)
  let base = apiBase();
  if (req) {
    const host = (req.headers.host as string) || 'localhost:3000';
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    base = `${proto}://${host}`;
  }

  const res = await fetch(`${base}/api/site`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function writeSiteData(data: SiteData): Promise<void> {
  const base = apiBase();

  const res = await fetch(`${base}/api/site`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
}
