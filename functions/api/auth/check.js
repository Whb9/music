// GET /api/auth/check
const SESSION_COOKIE = 'hbwlxy_session';

export async function onRequest({ request, env }) {
  const adminPassword = env.ADMIN_PASSWORD || 'hbwlxy123';
  const secret = env.SESSION_SECRET || 'hbwlxy_default_secret';

  // Parse session cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').filter(Boolean).map(c => {
      const idx = c.indexOf('=');
      return [c.slice(0, idx), c.slice(idx + 1)];
    })
  );
  const sessionToken = cookies[SESSION_COOKIE] || '';

  // Compute expected token
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret + adminPassword);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
  const expectedToken = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const authenticated = sessionToken === expectedToken;

  return new Response(JSON.stringify({ authenticated }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
