// src/pages/api/uploads/[key].ts
// Proxy R2 uploads — serves files from the UPLOADS bucket

import type { NextApiRequest, NextApiResponse } from 'next';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  const { key } = req.query as { key: string };
  if (!key) return res.status(400).json({ error: '缺少文件 key' });

  try {
    const { env } = getRequestContext();
    const bucket = env.UPLOADS as R2Bucket | undefined;
    if (!bucket) return res.status(500).json({ error: 'R2 not configured' });

    const obj = await bucket.get(key);
    if (!obj) return res.status(404).json({ error: '文件不存在' });

    const headers: Record<string, string> = {};
    if (obj.httpMetadata?.contentType) {
      headers['content-type'] = obj.httpMetadata.contentType;
    }
    if (obj.httpMetadata?.cacheControl) {
      headers['cache-control'] = obj.httpMetadata.cacheControl;
    }
    headers['cache-control'] = headers['cache-control'] || 'public, max-age=31536000';

    res.writeHead(200, headers);
    if (obj.body) {
      // Stream the R2 object body to the response
      const reader = obj.body.getReader();
      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) return;
        res.write(Buffer.from(value));
        return pump();
      };
      await pump();
    }
    res.end();
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
