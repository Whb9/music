// src/pages/api/upload.ts
// Cloudflare R2 edition — replaces formidable + fs
/// <reference types="@cloudflare/workers-types" />

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySession } from '@/lib/auth';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  if (!(await verifySession(req))) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }

  try {
    // Parse multipart form data using the native Request
    const formData = await new Response(req.body, {
      headers: { 'content-type': req.headers['content-type'] || 'multipart/form-data' },
    }).formData();

    const { env } = getRequestContext();
    const bucket = env.UPLOADS as R2Bucket | undefined;
    if (!bucket) {
      return res.status(500).json({ error: 'R2 binding "UPLOADS" not configured' });
    }

    const uploaded: string[] = [];

    for (const [_name, value] of formData.entries()) {
      if (value instanceof File) {
        const ext = value.name.split('.').pop() || 'bin';
        const key = `${crypto.randomUUID()}.${ext}`;
        await bucket.put(key, value.stream(), {
          httpMetadata: { contentType: value.type || 'application/octet-stream' },
        });
        uploaded.push(`/uploads/${key}`);
      }
    }

    return res.status(200).json({ success: true, files: uploaded });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
