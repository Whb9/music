// src/components/Footer.tsx
import React from 'react';
import type { SiteFooter } from '@/types';

interface FooterProps {
  footer: SiteFooter;
  collegeName: string;
}

export default function Footer({ footer, collegeName }: FooterProps) {
  return (
    <footer style={{ backgroundColor: '#008c8c', color: '#fff', marginTop: '32px' }}>
      {/* Top link row */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', padding: '10px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: '0', justifyContent: 'center' }}>
          {footer.links.map((link, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span style={{ color: 'rgba(255,255,255,0.4)', padding: '0 8px', fontSize: '13px' }}>／</span>}
              <a
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{ color: '#fff', fontSize: '13px', textDecoration: 'none', opacity: 0.9 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffd700')}
                onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
              >
                {link.label}
              </a>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Contact row */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '13px', opacity: 0.9 }}>
          <span>学院地址：{footer.address}</span>
          <span>联系电话：{footer.phone}</span>
          <span>邮政编码：{footer.postcode}</span>
          <span style={{ opacity: 0.7 }}>|</span>
          <span>合唱团：云谷合唱团（编号：20535054）</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {footer.wechat && (
            <div style={{ textAlign: 'center', fontSize: '12px' }}>
              <div style={{ fontSize: '22px', marginBottom: '2px' }}>💬</div>
              <div>教师微信</div>
            </div>
          )}
          {footer.email && (
            <div style={{ textAlign: 'center', fontSize: '12px' }}>
              <div style={{ fontSize: '22px', marginBottom: '2px' }}>✉️</div>
              <div>教师邮箱</div>
            </div>
          )}
          {!footer.wechat && (
            <div style={{ textAlign: 'center', fontSize: '12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <div>教师微信</div>
            </div>
          )}
          {!footer.email && (
            <div style={{ textAlign: 'center', fontSize: '12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <div>教师邮箱</div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
