// src/pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { clearSessionCookie } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', clearSessionCookie());
  return res.status(200).json({ success: true });
}
