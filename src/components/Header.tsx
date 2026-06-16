// src/components/Header.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { SiteInfo } from '@/types';

interface HeaderProps {
  site: SiteInfo;
}

export default function Header({ site }: HeaderProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header>
      {/* ── Top bar ── */}
      <div style={{ backgroundColor: '#008c8c' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '74px' }}>

            {/* Left: seal + school logo + college name */}
            <Link href="/course/chorus-conducting" style={{ display: 'flex', alignItems: 'center', gap: '0px', textDecoration: 'none' }}>
              {/* University seal */}
              <img
                src="/images/seal.png"
                alt="校徽"
                style={{ height: '55px', width: '55px', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* School name logo */}
              <img
                src={site.logo}
                alt="湖北文理学院"
                style={{ height: '60px', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* College name */}
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'normal', letterSpacing: '1px', lineHeight: '1.3', opacity: 0.9 }}>
                {site.collegeName}
              </div>
            </Link>

            {/* Right: admin + school link + search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Admin entrance – subtle */}
              <Link
                href="/admin"
                title="后台管理"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '12px',
                  textDecoration: 'none',
                  padding: '3px 8px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '3px',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
              >
                🔐 管理
              </Link>

              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>｜</span>

              {/* School website */}
              <a
                href={site.schoolUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '14px', textDecoration: 'none' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                学校官网
              </a>

              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>｜</span>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                搜索
              </button>
            </div>
          </div>

          {/* Expandable search */}
          {searchOpen && (
            <div style={{ paddingBottom: '10px', display: 'flex', gap: '0' }}>
              <input
                type="text"
                autoFocus
                placeholder="请输入搜索内容..."
                style={{ flex: 1, padding: '6px 12px', fontSize: '13px', border: 'none', outline: 'none', borderRadius: '3px 0 0 3px' }}
                onKeyDown={e => e.key === 'Enter' && setSearchOpen(false)}
              />
              <button
                onClick={() => setSearchOpen(false)}
                style={{ background: '#e6a817', color: '#fff', border: 'none', padding: '6px 16px', fontSize: '13px', cursor: 'pointer', borderRadius: '0 3px 3px 0' }}
              >
                搜索
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation bar ── */}
      <nav style={{ backgroundColor: '#007575' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex' }}>
          {site.nav.map((item, idx) => {
            const isCourse = item.label === '课程建设';
            const isActive = isCourse
              ? router.asPath.startsWith('/course')
              : false;
            return (
              <Link
                key={idx}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  color: '#fff',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#e6a817' : 'transparent',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'; }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
