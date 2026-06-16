// src/pages/api/import-data.ts
// Cloudflare D1 edition — replaces formidable + fs

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySession } from '@/lib/auth';
import { readSiteData, writeSiteData } from '@/lib/data';
import * as XLSX from 'xlsx';
import type { Teacher, Course } from '@/types';

export const config = {
  api: { bodyParser: false },
};

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
    return obj;
  });
}

function rowsToTeachers(rows: Record<string, string>[]): Teacher[] {
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

function rowsToCourses(rows: Record<string, string>[]): Course[] {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: '方法不允许' });
  if (!(await verifySession(req))) return res.status(401).json({ error: '未授权' });

  try {
    // Parse multipart form data
    const formData = await new Response(req.body, {
      headers: { 'content-type': req.headers['content-type'] || 'multipart/form-data' },
    }).formData();

    const type = (formData.get('type') as string) || 'teachers';
    const file = formData.get('file') as File | null;
    if (!file) return res.status(400).json({ error: '未找到上传文件' });

    const originalName = file.name;
    const ext = (originalName.split('.').pop()?.toLowerCase() ?? '');
    let rows: Record<string, string>[] = [];

    const buffer = await file.arrayBuffer();

    if (ext === 'json') {
      const text = new TextDecoder().decode(buffer);
      const parsed = JSON.parse(text);
      rows = Array.isArray(parsed) ? parsed : [parsed];
    } else if (ext === 'csv') {
      const text = new TextDecoder().decode(buffer);
      rows = parseCsv(text);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, string>[];
    } else {
      return res.status(400).json({ error: '不支持的文件格式，请使用 JSON、CSV 或 Excel 文件' });
    }

    const data = await readSiteData();

    if (type === 'teachers') {
      const imported = rowsToTeachers(rows);
      const map = new Map(data.teachers.map((t) => [t.id, t]));
      imported.forEach((t) => map.set(t.id, t));
      data.teachers = Array.from(map.values());
    } else if (type === 'courses') {
      const imported = rowsToCourses(rows);
      const map = new Map(data.courses.map((c) => [c.id, c]));
      imported.forEach((c) => map.set(c.id, c));
      data.courses = Array.from(map.values());
    }

    await writeSiteData(data);
    return res.status(200).json({ success: true, count: rows.length });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
