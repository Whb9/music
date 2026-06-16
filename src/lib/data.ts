// src/lib/data.ts
// Cloudflare D1 edition — replaces fs-based data/site.json persistence
/// <reference types="@cloudflare/workers-types" />

import type { SiteData, SiteInfo, Teacher, Course, Chapter } from '@/types';

function getDB(): D1Database {
  const db = (process.env as any).DB as D1Database | undefined;
  if (!db) throw new Error('D1 binding "DB" not found in environment');
  return db;
}

// ── Read ────────────────────────────────────────────────────

export async function readSiteData(): Promise<SiteData> {
  const db = getDB();

  // site_config (single row, id=1)
  const siteRow = await db.prepare('SELECT * FROM site_config WHERE id = 1').first<Record<string, any>>();
  if (!siteRow) {
    // Return empty defaults if not seeded
    return { site: emptySite(), teachers: [], courses: [] };
  }

  const site: SiteInfo = {
    schoolName: siteRow.schoolName as string,
    collegeName: siteRow.collegeName as string,
    title: siteRow.title as string,
    logo: siteRow.logo as string,
    campusImage: siteRow.campusImage as string,
    schoolUrl: siteRow.schoolUrl as string,
    nav: JSON.parse((siteRow.nav as string) || '[]'),
    footer: JSON.parse((siteRow.footer as string) || '{}'),
  };

  // teachers
  const teacherRows = await db.prepare('SELECT id, name, title, avatar, rank, department, bio, contact FROM teachers ORDER BY sort_order').all<Record<string, any>>();
  const teachers: Teacher[] = (teacherRows.results || []).map((r: Record<string, any>) => ({
    id: r.id as string,
    name: r.name as string,
    title: r.title as string,
    avatar: r.avatar as string,
    rank: r.rank as string,
    department: r.department as string,
    bio: r.bio as string,
    contact: r.contact as string,
  }));

  // courses
  const courseRows = await db.prepare('SELECT * FROM courses ORDER BY sort_order').all<Record<string, any>>();
  const courses: Course[] = [];

  for (const cr of courseRows.results || []) {
    const chapterRows = await db
      .prepare('SELECT * FROM chapters WHERE courseId = ? ORDER BY sort_order')
      .bind(cr.id as string)
      .all<Record<string, any>>();

    const chapters: Chapter[] = (chapterRows.results || []).map((ch: Record<string, any>) => ({
      id: ch.id as string,
      title: ch.title as string,
      requirements: ch.requirements as string,
      background: ch.background as string,
      appreciation: ch.appreciation as string,
      practice: ch.practice as string,
      images: JSON.parse((ch.images as string) || '[]'),
      videos: JSON.parse((ch.videos as string) || '[]'),
    }));

    courses.push({
      id: cr.id as string,
      name: cr.name as string,
      category: cr.category as string,
      subcategory: cr.subcategory as string,
      teacherId: cr.teacherId as string,
      coverImage: cr.coverImage as string,
      description: cr.description as string,
      objectives: cr.objectives as string,
      keyPoints: cr.keyPoints as string,
      difficulties: cr.difficulties as string,
      chapters,
    });
  }

  return { site, teachers, courses };
}

// ── Write ───────────────────────────────────────────────────

export async function writeSiteData(data: SiteData): Promise<void> {
  const db = getDB();
  const { site, teachers, courses } = data;

  // Use a batch for atomicity (D1 batches are not truly atomic across tables,
  // but within a single statement they are; we accept eventual consistency)
  const stmts: D1PreparedStatement[] = [];

  // Upsert site_config
  stmts.push(
    db.prepare(
      `INSERT OR REPLACE INTO site_config (id, schoolName, collegeName, title, logo, campusImage, schoolUrl, nav, footer, updated_at)
       VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, datetime('now'))`
    ).bind(
      site.schoolName, site.collegeName, site.title, site.logo,
      site.campusImage, site.schoolUrl,
      JSON.stringify(site.nav), JSON.stringify(site.footer)
    )
  );

  // Delete + re-insert teachers
  stmts.push(db.prepare('DELETE FROM teachers'));
  teachers.forEach((t, i) => {
    stmts.push(
      db.prepare(
        `INSERT INTO teachers (id, name, title, avatar, rank, department, bio, contact, sort_order)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
      ).bind(t.id, t.name, t.title, t.avatar, t.rank, t.department, t.bio, t.contact, i)
    );
  });

  // Delete + re-insert courses + chapters
  stmts.push(db.prepare('DELETE FROM chapters'));
  stmts.push(db.prepare('DELETE FROM courses'));
  courses.forEach((c, ci) => {
    stmts.push(
      db.prepare(
        `INSERT INTO courses (id, name, category, subcategory, teacherId, coverImage, description, objectives, keyPoints, difficulties, sort_order)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
      ).bind(c.id, c.name, c.category, c.subcategory, c.teacherId,
             c.coverImage, c.description, c.objectives, c.keyPoints, c.difficulties, ci)
    );
    (c.chapters || []).forEach((ch, chi) => {
      stmts.push(
        db.prepare(
          `INSERT INTO chapters (id, courseId, sort_order, title, requirements, background, appreciation, practice, images, videos)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
        ).bind(ch.id, c.id, chi, ch.title, ch.requirements, ch.background,
               ch.appreciation, ch.practice, JSON.stringify(ch.images || []), JSON.stringify(ch.videos || []))
      );
    });
  });

  await db.batch(stmts);
}

// ── Helpers ─────────────────────────────────────────────────

function emptySite(): SiteInfo {
  return {
    schoolName: '', collegeName: '', title: '',
    logo: '', campusImage: '', schoolUrl: '',
    nav: [{ label: '首页', href: '/' }],
    footer: { links: [], address: '', phone: '', postcode: '', wechat: '', email: '' },
  };
}
