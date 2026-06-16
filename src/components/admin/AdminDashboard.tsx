// src/components/admin/AdminDashboard.tsx
import React, { useState, useCallback } from 'react';
import type { SiteData } from '@/types';
import SiteEditor from './SiteEditor';
import CourseEditor from './CourseEditor';
import TeacherEditor from './TeacherEditor';
import MediaUploader from './MediaUploader';
import ImportExportPanel from './ImportExportPanel';

interface AdminDashboardProps {
  initialData: SiteData;
  onLogout: () => void;
}

type Tab = 'site' | 'courses' | 'teachers' | 'media' | 'import';

const TEAL = '#008c8c';

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'site',     label: '网站信息', icon: '🏫' },
  { key: 'courses',  label: '课程管理', icon: '📚' },
  { key: 'teachers', label: '教师管理', icon: '👩‍🏫' },
  { key: 'media',    label: '素材上传', icon: '🖼️' },
  { key: 'import',   label: '导入导出', icon: '📦' },
];

export default function AdminDashboard({ initialData, onLogout }: AdminDashboardProps) {
  const [data, setData]           = useState<SiteData>(initialData);
  const [activeTab, setActiveTab] = useState<Tab>('site');
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');

  const save = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? '保存失败');
      }
      setSaveMsg('✓ 保存成功');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(`✗ ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    onLogout();
  };

  const reloadData = useCallback(async () => {
    const res = await fetch('/api/site');
    if (res.ok) setData(await res.json() as SiteData);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f2f5' }}>
      {/* Top bar */}
      <div style={{ background: TEAL, color: '#fff', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '50px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>🎵 后台管理系统</span>
          <span style={{ fontSize: '12px', opacity: 0.75 }}>湖北文理学院 音乐与舞蹈学院</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/course/chorus-conducting" target="_blank" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', padding: '3px 10px', borderRadius: '3px' }}>
            查看前台 ↗
          </a>
          <button onClick={handleLogout} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', background: 'none', border: '1px solid rgba(255,255,255,0.3)', padding: '3px 10px', borderRadius: '3px', cursor: 'pointer' }}>
            退出
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: '160px', background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <nav style={{ flex: 1, paddingTop: '8px' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', padding: '12px 16px', border: 'none',
                  fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                  color: activeTab === tab.key ? '#fff' : '#555',
                  background: activeTab === tab.key ? TEAL : 'transparent',
                  borderLeft: activeTab === tab.key ? `3px solid #005f5f` : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (activeTab !== tab.key) (e.currentTarget as HTMLButtonElement).style.background = '#f0f9f9'; }}
                onMouseLeave={e => { if (activeTab !== tab.key) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Save button */}
          <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={save}
              disabled={saving}
              style={{ width: '100%', background: TEAL, color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? '保存中...' : '💾 保存全部'}
            </button>
            {saveMsg && (
              <div style={{ marginTop: '6px', fontSize: '12px', textAlign: 'center', color: saveMsg.startsWith('✓') ? '#16a34a' : '#dc2626' }}>
                {saveMsg}
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
            {activeTab === 'site'     && <SiteEditor site={data.site} onChange={site => setData({ ...data, site })} />}
            {activeTab === 'courses'  && <CourseEditor courses={data.courses} teachers={data.teachers} onChange={courses => setData({ ...data, courses })} />}
            {activeTab === 'teachers' && <TeacherEditor teachers={data.teachers} onChange={teachers => setData({ ...data, teachers })} />}
            {activeTab === 'media'    && <MediaUploader courses={data.courses} onCoursesChange={(courses) => setData({ ...data, courses })} />}
            {activeTab === 'import'   && <ImportExportPanel data={data} onImportSuccess={reloadData} />}
          </div>
        </main>
      </div>
    </div>
  );
}
