// GET /api/uploads/:key — proxy files from COS
async function hmacSha1(key, data) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', typeof key === 'string' ? encoder.encode(key) : key,
    { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return new Uint8Array(sig);
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

async function cosAuth(secretId, secretKey, method, key, bucket, region) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 600;
  const keyTime = `${now};${exp}`;
  const signKey = await hmacSha1(secretKey, keyTime);
  const signKeyHex = toHex(signKey);

  const httpString = `${method.toLowerCase()}\n/${key}\n\nhost=${bucket}.cos.${region}.myqcloud.com\n`;
  const sha1Http = toHex(new Uint8Array(
    await crypto.subtle.digest('SHA-1', new TextEncoder().encode(httpString))
  ));
  const stringToSign = `sha1\n${keyTime}\n${sha1Http}\n`;
  const signature = toHex(await hmacSha1(
    new Uint8Array(signKeyHex.match(/.{2}/g).map(b => parseInt(b, 16))),
    stringToSign
  ));

  return [
    `q-sign-algorithm=sha1`,
    `q-ak=${secretId}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=host`,
    `q-url-param-list=`,
    `q-signature=${signature}`,
  ].join('&');
}

export async function onRequest({ request, params, env }) {
  const key = `uploads/${params.key}`;
  const secretId = env.COS_SECRET_ID;
  const secretKey = env.COS_SECRET_KEY;
  const bucket = env.COS_BUCKET;
  const region = env.COS_REGION || 'ap-guangzhou';

  // If COS is configured, proxy from COS
  if (secretId && secretKey && bucket) {
    try {
      const auth = await cosAuth(secretId, secretKey, 'GET', key, bucket, region);
      const cosUrl = `https://${bucket}.cos.${region}.myqcloud.com/${key}`;
      const cosRes = await fetch(cosUrl, {
        headers: { 'Authorization': auth },
      });

      if (!cosRes.ok) {
        return new Response('文件不存在', { status: 404 });
      }

      return new Response(cosRes.body, {
        status: cosRes.status,
        headers: {
          'content-type': cosRes.headers.get('content-type') || 'application/octet-stream',
          'cache-control': 'public, max-age=31536000',
        },
      });
    } catch {
      return new Response('文件获取失败', { status: 500 });
    }
  }

  // Fallback: try public COS bucket (no auth)
  if (bucket && region) {
    return Response.redirect(
      `https://${bucket}.cos.${region}.myqcloud.com/${key}`,
      302
    );
  }

  return new Response('文件存储未配置', { status: 500 });
}
