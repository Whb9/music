// src/pages/api/auth/check.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySession } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAuthenticated = await verifySession(req);
  return res.status(200).json({ authenticated: isAuthenticated });
}
