// POST /api/auth/logout
const SESSION_COOKIE = 'hbwlxy_session';

export function onRequest() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0`,
    },
  });
}
