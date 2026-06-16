// src/pages/api/site/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySession } from '@/lib/auth';
import { readSiteData, writeSiteData } from '@/lib/data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = await readSiteData();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  }

  if (req.method === 'POST') {
    if (!(await verifySession(req))) {
      return res.status(401).json({ error: '未授权，请先登录' });
    }
    try {
      await writeSiteData(req.body);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  }

  return res.status(405).json({ error: '方法不允许' });
}
