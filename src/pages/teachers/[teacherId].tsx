// src/pages/teachers/[teacherId].tsx
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { readSiteData } from '@/lib/data';
import type { SiteData, Teacher } from '@/types';

const TEAL = '#008c8c';

interface TeacherPageProps {
  siteData: SiteData;
  teacher: Teacher;
}

export default function TeacherPage({ siteData, teacher }: TeacherPageProps) {
  const { site, teachers } = siteData;

  return (
    <>
      <Head>
        <title>{teacher.name} — {site.schoolName} {site.collegeName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
        <Header site={site} />

        {/* Banner */}
        <div style={{ width: '100%', height: '220px', overflow: 'hidden' }}>
          <img
            src={site.campusImage}
            alt="校园"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
          />
        </div>

        {/* Breadcrumb */}
        <div style={{ background: '#f0f0f0', borderBottom: '1px solid #e5e7eb', padding: '6px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', fontSize: '13px', color: '#888' }}>
            <a href="/course/chorus-conducting" style={{ color: TEAL }}>首页</a>
            <span style={{ margin: '0 6px' }}>›</span>
            <span>师资队伍</span>
            <span style={{ margin: '0 6px' }}>›</span>
            <span>{teacher.name}</span>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '24px', display: 'flex', gap: '20px' }}>
          {/* Sidebar */}
          <div style={{ width: '160px', flexShrink: 0 }}>
            <div style={{ background: TEAL, color: '#fff', textAlign: 'center', padding: '10px', fontSize: '14px', fontWeight: 'bold' }}>
              师资队伍
            </div>
            {teachers.map(t => (
              <a
                key={t.id}
                href={`/teachers/${t.id}`}
                style={{
                  display: 'block',
                  padding: '10px 8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: t.id === teacher.id ? '#fff' : '#333',
                  background: t.id === teacher.id ? TEAL : '#fff',
                  borderBottom: '1px solid #e5e7eb',
                  textDecoration: 'none',
                }}
              >
                {t.name}
              </a>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, background: '#fff', padding: '24px', border: '1px solid #e5e7eb' }}>
            <div style={{ color: TEAL, fontSize: '17px', fontWeight: 'bold', borderBottom: `2px solid ${TEAL}`, paddingBottom: '8px', marginBottom: '20px' }}>
              教师详情
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  style={{ width: '190px', height: '240px', objectFit: 'cover', border: '1px solid #e5e7eb', display: 'block' }}
                />
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '8px' }}>
                  {teacher.title}：{teacher.name}
                </div>
                {teacher.rank && <div style={{ fontSize: '13px', color: '#666' }}>{teacher.rank}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }}>{teacher.name}</div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>{teacher.title} · {teacher.rank}</div>
                <div style={{ fontSize: '14px', lineHeight: '1.9', color: '#333', whiteSpace: 'pre-wrap' }}>
                  {teacher.bio || '暂无简介'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer footer={site.footer} collegeName={site.collegeName} />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { teacherId } = context.params as { teacherId: string };
  const siteData = await readSiteData(context.req);
  const teacher = siteData.teachers.find(t => t.id === teacherId);
  if (!teacher) return { notFound: true };
  return { props: { siteData, teacher } };
};
