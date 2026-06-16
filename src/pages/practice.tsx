// src/pages/practice.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function PracticePage() {
  const router = useRouter();
  const { courseId, chapterIdx } = router.query as { courseId?: string; chapterIdx?: string };

  const backUrl = courseId
    ? `/course/${courseId}?chapter=${chapterIdx ?? '0'}&section=practice`
    : '/';

  return (
    <>
      <Head>
        <title>音高识别与乐谱练习</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#07090c' }}>
        {/* Top bar */}
        <div style={{
          height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 14px', borderBottom: '1px solid #1a2030', flexShrink: 0,
          background: '#0c0f14',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#dde4ef', letterSpacing: '1px' }}>
            🎵 Vocal Pitch · 教学练习
          </div>
          <a
            href={backUrl}
            style={{
              color: '#6a7890',
              fontSize: '12px',
              textDecoration: 'none',
              padding: '4px 12px',
              border: '1px solid #1a2030',
              borderRadius: '4px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#dde4ef';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = '#38465a';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#6a7890';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1a2030';
            }}
          >
            ← 返回课程
          </a>
        </div>

        {/* Full-screen iframe */}
        <iframe
          src="/pitch-to-score.html"
          style={{ width: '100%', flex: 1, border: 'none', display: 'block' }}
          title="音高识别与乐谱练习"
          allow="microphone; autoplay"
        />
      </div>
    </>
  );
}
