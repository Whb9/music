// POST /api/upload — file upload to COS (EdgeOne Edge Function)
const SESSION_COOKIE = 'hbwlxy_session';

async function verifyAuth(request, env) {
  const adminPassword = env.ADMIN_PASSWORD || 'hbwlxy123';
  const secret = env.SESSION_SECRET || 'hbwlxy_default_secret';
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').filter(Boolean).map(c => {
      const idx = c.indexOf('=');
      return [c.slice(0, idx), c.slice(idx + 1)];
    })
  );
  const sessionToken = cookies[SESSION_COOKIE] || '';
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret + adminPassword);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
  const expectedToken = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return sessionToken === expectedToken;
}

// HMAC-SHA1 for COS signature
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

// Generate COS authorization header
async function cosAuth(secretId, secretKey, method, key, bucket, region) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 600; // 10 minutes
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

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '方法不允许' }), {
      status: 405, headers: { 'content-type': 'application/json' },
    });
  }

  if (!(await verifyAuth(request, env))) {
    return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
      status: 401, headers: { 'content-type': 'application/json' },
    });
  }

  // Check COS config
  const secretId = env.COS_SECRET_ID;
  const secretKey = env.COS_SECRET_KEY;
  const bucket = env.COS_BUCKET;
  const region = env.COS_REGION || 'ap-guangzhou';
  if (!secretId || !secretKey || !bucket) {
    return new Response(JSON.stringify({
      error: 'COS 未配置，请在 EdgeOne 控制台设置环境变量: COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET, COS_REGION',
    }), { status: 500, headers: { 'content-type': 'application/json' } });
  }

  try {
    const formData = await request.formData();
    const uploaded = [];

    for (const [_name, value] of formData.entries()) {
      if (value instanceof File) {
        const ext = value.name.split('.').pop() || 'bin';
        const key = `uploads/${crypto.randomUUID()}.${ext}`;
        const auth = await cosAuth(secretId, secretKey, 'PUT', key, bucket, region);
        const cosUrl = `https://${bucket}.cos.${region}.myqcloud.com/${key}`;

        const cosRes = await fetch(cosUrl, {
          method: 'PUT',
          headers: {
            'Authorization': auth,
            'Content-Type': value.type || 'application/octet-stream',
            'Host': `${bucket}.cos.${region}.myqcloud.com`,
          },
          body: value.stream(),
        });

        if (cosRes.ok) {
          uploaded.push(`/uploads/${key.replace('uploads/', '')}`);
        } else {
          const errText = await cosRes.text();
          console.error('COS upload failed:', cosRes.status, errText);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, files: uploaded }), {
      status: 200, headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'content-type': 'application/json' },
    });
  }
}
