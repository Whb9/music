// POST /api/auth/login
const SESSION_COOKIE = 'hbwlxy_session';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '方法不允许' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const password = body.password || '';
    const adminPassword = env.ADMIN_PASSWORD || 'hbwlxy123';

    if (password !== adminPassword) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Simple signed token
    const secret = env.SESSION_SECRET || 'hbwlxy_default_secret';
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret + adminPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    const token = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'set-cookie': `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax`,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
