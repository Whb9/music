// POST /api/import-data — import teachers/courses from JSON/CSV file
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

function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
}

function rowsToTeachers(rows) {
  return rows.map((row, i) => ({
    id: row['id'] || `teacher-${i + 1}`,
    name: row['name'] || row['姓名'] || '',
    title: row['title'] || row['职务'] || '教师',
    avatar: row['avatar'] || row['头像'] || '/images/teacher.jpg',
    rank: row['rank'] || row['职称'] || '',
    department: row['department'] || row['学院'] || '音乐与舞蹈学院',
    bio: row['bio'] || row['简介'] || '',
    contact: row['contact'] || row['联系方式'] || '',
  }));
}

function rowsToCourses(rows) {
  return rows.map((row, i) => ({
    id: row['id'] || `course-${i + 1}`,
    name: row['name'] || row['课程名称'] || '',
    category: row['category'] || row['课程类别'] || '音乐学',
    subcategory: row['subcategory'] || row['子类别'] || '',
    teacherId: row['teacherId'] || row['教师ID'] || '',
    coverImage: row['coverImage'] || '/images/choir.jpg',
    description: row['description'] || row['课程简介'] || '',
    objectives: row['objectives'] || row['教学目标'] || '',
    keyPoints: row['keyPoints'] || row['教学重点'] || '',
    difficulties: row['difficulties'] || row['教学难点'] || '',
    chapters: [],
  }));
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '方法不允许' }), {
      status: 405, headers: { 'content-type': 'application/json' },
    });
  }

  if (!(await verifyAuth(request, env))) {
    return new Response(JSON.stringify({ error: '未授权' }), {
      status: 401, headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const type = (formData.get('type') || 'teachers').toString();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: '未找到上传文件' }), {
        status: 400, headers: { 'content-type': 'application/json' },
      });
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!['json', 'csv'].includes(ext)) {
      return new Response(JSON.stringify({
        error: '不支持的文件格式。EdgeOne 环境支持 JSON 和 CSV，Excel 文件请先转换为 CSV',
      }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const text = await file.text();
    let rows = [];

    if (ext === 'json') {
      const parsed = JSON.parse(text);
      rows = Array.isArray(parsed) ? parsed : [parsed];
    } else if (ext === 'csv') {
      rows = parseCsv(text);
    }

    // Read current site data from KV
    const raw = await env.SITE_DATA.get(KV_KEY);
    const data = raw ? JSON.parse(raw) : { site: {}, teachers: [], courses: [] };

    if (type === 'teachers') {
      const imported = rowsToTeachers(rows);
      const map = new Map((data.teachers || []).map(t => [t.id, t]));
      imported.forEach(t => map.set(t.id, t));
      data.teachers = Array.from(map.values());
    } else if (type === 'courses') {
      const imported = rowsToCourses(rows);
      const map = new Map((data.courses || []).map(c => [c.id, c]));
      imported.forEach(c => map.set(c.id, c));
      data.courses = Array.from(map.values());
    }

    await env.SITE_DATA.put(KV_KEY, JSON.stringify(data));

    return new Response(JSON.stringify({ success: true, count: rows.length }), {
      status: 200, headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'content-type': 'application/json' },
    });
  }
}
