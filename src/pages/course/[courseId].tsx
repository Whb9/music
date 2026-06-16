// src/pages/course/[courseId].tsx
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useCallback } from 'react';
import { readSiteData } from '@/lib/data';
import type { SiteData, Course, Teacher, Chapter } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PageProps {
  siteData: SiteData;
  course: Course;
  teacher?: Teacher;
}

// ─── Teal color constant ───────────────────────────────────
const TEAL = '#008c8c';

// ─── Speaker button for TTS ─────────────────────────────
function SpeakButton({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);

  const speak = useCallback(() => {
    const synth = window.speechSynthesis;
    if (playing) {
      synth.cancel();
      setPlaying(false);
      return;
    }
    if (!text) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 0.9;
    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    synth.speak(utter);
    setPlaying(true);
  }, [text, playing]);

  if (!text) return null;

  return (
    <button
      onClick={speak}
      title={playing ? '停止朗读' : '朗读文字'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: playing ? `2px solid ${TEAL}` : '2px solid #d1d5db',
        background: playing ? '#e6f5f5' : '#fff',
        color: playing ? TEAL : '#6b7280',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (!playing) (e.currentTarget as HTMLButtonElement).style.borderColor = TEAL; }}
      onMouseLeave={e => { if (!playing) (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db'; }}
    >
      {playing ? '⏹' : '🔊'}
    </button>
  );
}

// ─── Section title with full-width underline ──────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <h2 style={{ color: TEAL, fontSize: '17px', fontWeight: 'bold', paddingBottom: '8px', borderBottom: `2px solid ${TEAL}`, marginBottom: 0 }}>
        {children}
      </h2>
    </div>
  );
}

// ─── Teacher column (left side of content) ────────────────
function TeacherColumn({ teacher }: { teacher?: Teacher }) {
  if (!teacher) return null;
  return (
    <div style={{ flexShrink: 0, width: '280px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src={teacher.avatar}
        alt={teacher.name}
        style={{
          width: '260px',
          height: '350px',
          objectFit: 'cover',
          border: '1px solid #e5e7eb',
          display: 'block',
          borderRadius: '4px',
        }}
        onError={e => {
          const el = e.target as HTMLImageElement;
          el.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='350' viewBox='0 0 260 350'%3E%3Crect fill='%23f3f4f6' width='260' height='350'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23aaa' font-size='15'%3E暂无头像%3C/text%3E%3C/svg%3E`;
        }}
      />
      <div style={{ fontSize: '13px', color: '#666', marginTop: '12px' }}>
        主讲教师：<span style={{ fontSize: '16px', fontWeight: 'bold', color: '#222' }}>{teacher.name}</span>
      </div>
      {teacher.rank && (
        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>{teacher.rank}</div>
      )}
    </div>
  );
}

// ─── Course Intro content ─────────────────────────────────
function CourseIntro({ course, teacher, onChapterClick }: {
  course: Course; teacher?: Teacher; onChapterClick: (idx: number) => void;
}) {
  return (
    <div>
      <SectionHeading>课程简介：</SectionHeading>

      {/* Teacher photo + description row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <TeacherColumn teacher={teacher} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', lineHeight: '1.9', color: '#333', textIndent: '2em', marginBottom: '12px' }}>
            {course.description}
          </p>
          {course.objectives && (
            <p style={{ fontSize: '14px', lineHeight: '1.9', color: '#333' }}>
              {course.objectives}
            </p>
          )}
        </div>
      </div>

      {/* Chapter list */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '12px' }}>
          课程教学内容及要求：
        </div>
        <div style={{ columns: '2', columnGap: '20px' }}>
          {course.chapters.map((ch, idx) => (
            <div key={ch.id} style={{ breakInside: 'avoid', marginBottom: '4px' }}>
              <button
                onClick={() => onChapterClick(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: TEAL,
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '2px 0',
                  textAlign: 'left',
                  textDecoration: 'underline',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {ch.title}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chapter Detail content ───────────────────────────────
function ChapterDetail({ chapter, section, teacher, courseId, chapterIdx }: {
  chapter: Chapter; section: string; teacher?: Teacher; courseId: string; chapterIdx: number;
}) {
  const renderContent = () => {
    if (section === 'requirements' || section === 'intro') {
      return (
        <div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: TEAL, marginBottom: '14px', paddingBottom: '8px', borderBottom: `1px solid ${TEAL}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>章节教学目标及教学要求：</span>
            <SpeakButton text={chapter.requirements} />
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap' }}>
            {chapter.requirements || '（暂无内容）'}
          </div>
        </div>
      );
    }
    if (section === 'background') {
      return (
        <div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: TEAL, marginBottom: '14px', paddingBottom: '8px', borderBottom: `1px solid ${TEAL}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>教学曲目背景：</span>
            <SpeakButton text={chapter.background} />
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap' }}>
            {chapter.background || '（暂无内容）'}
          </div>
          {chapter.images.length > 0 && (
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {chapter.images.map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: '100%', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
              ))}
            </div>
          )}
        </div>
      );
    }
    if (section === 'appreciation') {
      return (
        <div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: TEAL, marginBottom: '14px', paddingBottom: '8px', borderBottom: `1px solid ${TEAL}` }}>
            教学曲目赏析：
          </div>
          {chapter.videos.length > 0 ? (
            <div style={{ marginTop: '8px' }}>
              {chapter.videos.map((src, i) => (
                <video key={i} controls style={{ width: '100%', borderRadius: '4px', border: '1px solid #e5e7eb', marginBottom: '12px' }} src={src}>
                  您的浏览器不支持视频播放
                </video>
              ))}
            </div>
          ) : (
            <div style={{
              background: '#f8f8f8',
              border: '2px dashed #ddd',
              borderRadius: '6px',
              padding: '40px',
              textAlign: 'center',
              color: '#aaa',
              fontSize: '13px'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎬</div>
              <div>视频文件将在后台上传后显示</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                {chapter.background && <span style={{ color: '#888' }}>{chapter.appreciation}</span>}
              </div>
            </div>
          )}
        </div>
      );
    }
    if (section === 'practice') {
      return (
        <div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: TEAL, marginBottom: '14px', paddingBottom: '8px', borderBottom: `1px solid ${TEAL}` }}>
            教学曲目练习：
          </div>
          {chapter.practice && (
            <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap', marginBottom: '24px' }}>
              {chapter.practice}
            </div>
          )}
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <a
              href={`/practice?courseId=${courseId}&chapterIdx=${chapterIdx}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: TEAL,
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
                padding: '14px 48px',
                borderRadius: '6px',
                textDecoration: 'none',
                letterSpacing: '2px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              🎵 开始练习
            </a>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '12px' }}>
              点击进入全屏练习模式，支持麦克风录音、音高识别与乐谱生成
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '24px' }}>
        <TeacherColumn teacher={teacher} />
        <div style={{ flex: 1 }}>{renderContent()}</div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────
export default function CoursePage({ siteData, course, teacher }: PageProps) {
  const router = useRouter();
  const { site } = siteData;

  const chapterStr = router.query.chapter as string | undefined;
  const isChapterView = chapterStr !== undefined;
  const chapterIdx = Math.max(0, Math.min(parseInt(chapterStr ?? '0', 10), course.chapters.length - 1));
  const section = (router.query.section as string) || 'requirements';
  const chapter = course.chapters[chapterIdx];

  const baseUrl = `/course/${course.id}`;

  // Navigate to chapter
  const goToChapter = (idx: number) => {
    router.push(`${baseUrl}?chapter=${idx}&section=requirements`);
  };

  // Navigate to section within chapter
  const goToSection = (sec: string) => {
    router.push(`${baseUrl}?chapter=${chapterIdx}&section=${sec}`);
  };

  // ── Sidebar items for chapter view ──
  const chapterSections = [
    { key: 'requirements', label: '教学内容要求' },
    { key: 'background',   label: '教学曲目背景' },
    { key: 'appreciation', label: '教学曲目赏析' },
    { key: 'practice',     label: '教学曲目练习' },
  ];

  // ── Sidebar items for intro view ──
  const introCategories = [
    { label: '舞蹈表演', href: '#' },
    { label: '音乐学',   href: baseUrl },
  ];

  return (
    <>
      <Head>
        <title>{course.name} — {site.schoolName} {site.collegeName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
        <Header site={site} />

        {/* ── Banner + sidebar label ── */}
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          {/* Campus image — NO overlay */}
          <div style={{ width: '100%', height: '320px', overflow: 'hidden' }}>
            <img
              src={site.campusImage}
              alt="校园风光"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }}
              onError={e => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                if (el.parentElement) {
                  el.parentElement.style.background = 'linear-gradient(180deg, #5ba3c9 0%, #2a7fa8 60%, #1a5a7a 100%)';
                }
              }}
            />
          </div>

          {/* Sidebar label — overlaps the bottom of the banner */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <div
                style={{
                  width: '160px',
                  backgroundColor: TEAL,
                  color: '#fff',
                  textAlign: 'center',
                  padding: '10px 0',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                }}
              >
                {isChapterView ? course.name : '课程建设'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main body ── */}
        <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', paddingBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

            {/* ── Left sidebar ── */}
            <div style={{ width: '160px', flexShrink: 0 }}>
              {isChapterView ? (
                /* Chapter-view sidebar */
                <div>
                  {chapterSections.map(({ key, label }) => {
                    const isActive = section === key;
                    return (
                      <button
                        key={key}
                        onClick={() => goToSection(key)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'center',
                          padding: '11px 8px',
                          fontSize: '14px',
                          fontWeight: isActive ? 'bold' : 'normal',
                          color: isActive ? TEAL : '#333',
                          background: isActive ? '#e6f5f5' : '#fff',
                          border: 'none',
                          borderBottom: '1px solid #e5e7eb',
                          borderLeft: isActive ? `3px solid ${TEAL}` : '3px solid transparent',
                          cursor: 'pointer',
                          letterSpacing: '1px',
                        }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = TEAL; }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#333'; }}
                      >
                        {label}
                      </button>
                    );
                  })}
                  {/* Back to intro */}
                  <button
                    onClick={() => router.push(baseUrl)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'center',
                      padding: '8px',
                      fontSize: '12px',
                      color: '#888',
                      background: '#fafafa',
                      border: 'none',
                      borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      marginTop: '8px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = TEAL)}
                    onMouseLeave={e => (e.currentTarget.style.color = '#888')}
                  >
                    ← 返回课程简介
                  </button>
                </div>
              ) : (
                /* Intro-view sidebar */
                <div>
                  {introCategories.map(({ label, href }) => {
                    const isActive = label === '音乐学';
                    return (
                      <div
                        key={label}
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontSize: isActive ? '16px' : '15px',
                          fontWeight: isActive ? 'bold' : 'normal',
                          color: isActive ? '#333' : '#555',
                          background: '#fff',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          letterSpacing: '2px',
                          borderLeft: isActive ? `3px solid ${TEAL}` : '3px solid transparent',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = TEAL)}
                        onMouseLeave={e => (e.currentTarget.style.color = isActive ? '#333' : '#555')}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Right content ── */}
            <div style={{ flex: 1, minWidth: 0, background: '#fff', padding: '20px 24px', border: '1px solid #e5e7eb' }}>
              {isChapterView && chapter ? (
                <ChapterDetail chapter={chapter} section={section} teacher={teacher} courseId={course.id} chapterIdx={chapterIdx} />
              ) : (
                <CourseIntro course={course} teacher={teacher} onChapterClick={goToChapter} />
              )}
            </div>
          </div>
        </div>

        <Footer footer={site.footer} collegeName={site.collegeName} />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { courseId } = context.params as { courseId: string };
  const siteData = await readSiteData();
  const course = siteData.courses.find(c => c.id === courseId);
  if (!course) return { notFound: true };
  const teacher = siteData.teachers.find(t => t.id === course.teacherId) ?? null;
  return { props: { siteData, course, teacher } };
};
