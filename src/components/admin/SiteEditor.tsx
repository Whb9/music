// src/components/admin/SiteEditor.tsx
import React from 'react';
import type { SiteInfo } from '@/types';

interface SiteEditorProps {
  site: SiteInfo;
  onChange: (site: SiteInfo) => void;
}

export default function SiteEditor({ site, onChange }: SiteEditorProps) {
  const update = (field: keyof SiteInfo, value: string) => {
    onChange({ ...site, [field]: value });
  };

  const updateFooter = (field: string, value: string) => {
    onChange({ ...site, footer: { ...site.footer, [field]: value } });
  };

  const updateFooterLink = (idx: number, key: 'label' | 'href', value: string) => {
    const links = [...site.footer.links];
    links[idx] = { ...links[idx], [key]: value };
    onChange({ ...site, footer: { ...site.footer, links } });
  };

  const addFooterLink = () => {
    const links = [...site.footer.links, { label: '新链接', href: '#' }];
    onChange({ ...site, footer: { ...site.footer, links } });
  };

  const removeFooterLink = (idx: number) => {
    const links = site.footer.links.filter((_, i) => i !== idx);
    onChange({ ...site, footer: { ...site.footer, links } });
  };

  const updateNav = (idx: number, key: 'label' | 'href', value: string) => {
    const nav = [...site.nav];
    nav[idx] = { ...nav[idx], [key]: value };
    onChange({ ...site, nav });
  };

  const addNav = () => {
    onChange({ ...site, nav: [...site.nav, { label: '新栏目', href: '/' }] });
  };

  const removeNav = (idx: number) => {
    onChange({ ...site, nav: site.nav.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-gray-800 border-b pb-2" style={{ borderColor: '#008c8c' }}>
        网站基础信息
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">学校名称</label>
          <input className="admin-input" value={site.schoolName} onChange={(e) => update('schoolName', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">学院名称</label>
          <input className="admin-input" value={site.collegeName} onChange={(e) => update('collegeName', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">网站标题</label>
          <input className="admin-input" value={site.title} onChange={(e) => update('title', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">学校官网链接</label>
          <input className="admin-input" value={site.schoolUrl} onChange={(e) => update('schoolUrl', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Logo 图片路径</label>
          <input className="admin-input" value={site.logo} onChange={(e) => update('logo', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">横幅背景图路径</label>
          <input className="admin-input" value={site.campusImage} onChange={(e) => update('campusImage', e.target.value)} />
        </div>
      </div>

      {/* Navigation */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-gray-700">顶部导航</h3>
          <button onClick={addNav} className="admin-btn-sm">+ 添加</button>
        </div>
        <div className="space-y-2">
          {site.nav.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                className="admin-input flex-1"
                value={item.label}
                placeholder="栏目名"
                onChange={(e) => updateNav(idx, 'label', e.target.value)}
              />
              <input
                className="admin-input flex-1"
                value={item.href}
                placeholder="链接"
                onChange={(e) => updateNav(idx, 'href', e.target.value)}
              />
              <button onClick={() => removeNav(idx)} className="text-red-400 hover:text-red-600 text-sm px-2">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">页脚信息</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">学院地址</label>
            <input className="admin-input" value={site.footer.address} onChange={(e) => updateFooter('address', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">联系电话</label>
            <input className="admin-input" value={site.footer.phone} onChange={(e) => updateFooter('phone', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">邮政编码</label>
            <input className="admin-input" value={site.footer.postcode} onChange={(e) => updateFooter('postcode', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">教师微信</label>
            <input className="admin-input" value={site.footer.wechat} onChange={(e) => updateFooter('wechat', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">教师邮箱</label>
            <input className="admin-input" value={site.footer.email} onChange={(e) => updateFooter('email', e.target.value)} />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-gray-600">页脚快捷链接</label>
            <button onClick={addFooterLink} className="admin-btn-sm">+ 添加</button>
          </div>
          {site.footer.links.map((link, idx) => (
            <div key={idx} className="flex gap-2 items-center mb-2">
              <input
                className="admin-input flex-1"
                value={link.label}
                placeholder="链接名称"
                onChange={(e) => updateFooterLink(idx, 'label', e.target.value)}
              />
              <input
                className="admin-input flex-1"
                value={link.href}
                placeholder="URL"
                onChange={(e) => updateFooterLink(idx, 'href', e.target.value)}
              />
              <button onClick={() => removeFooterLink(idx)} className="text-red-400 hover:text-red-600 text-sm px-2">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
