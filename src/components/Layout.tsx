// src/components/Layout.tsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import type { SiteInfo } from '@/types';

interface LayoutProps {
  site: SiteInfo;
  children: React.ReactNode;
}

export default function Layout({ site, children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header site={site} />
      <main className="flex-1">{children}</main>
      <Footer footer={site.footer} collegeName={site.collegeName} />
    </div>
  );
}
