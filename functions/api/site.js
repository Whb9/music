// GET/POST /api/site — full site data CRUD via EdgeOne KV
const SESSION_COOKIE = 'hbwlxy_session';
const KV_KEY = 'site_data';

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

function emptySiteData() {
  return {
    site: {
      schoolName: '', collegeName: '', title: '',
      logo: '', campusImage: '', schoolUrl: '',
      nav: [{ label: '首页', href: '/' }],
      footer: { links: [], address: '', phone: '', postcode: '', wechat: '', email: '' },
    },
    teachers: [],
    courses: [],
  };
}

export async function onRequest({ request, env }) {
  // GET: read site data
  if (request.method === 'GET') {
    try {
      const raw = await env.SITE_DATA.get(KV_KEY);
      const data = raw ? JSON.parse(raw) : emptySiteData();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  // POST: write site data (requires auth)
  if (request.method === 'POST') {
    if (!(await verifyAuth(request, env))) {
      return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    try {
      const data = await request.json();
      await env.SITE_DATA.put(KV_KEY, JSON.stringify(data));
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: '方法不允许' }), {
    status: 405,
    headers: { 'content-type': 'application/json' },
  });
}
