// src/pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionCookie } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD || 'hbwlxy123';

  if (!password || password !== adminPassword) {
    return res.status(401).json({ error: '密码错误' });
  }

  const sessionCookie = await getSessionCookie(adminPassword);
  res.setHeader('Set-Cookie', sessionCookie);
  return res.status(200).json({ success: true });
}
