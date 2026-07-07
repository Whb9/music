// src/pages/admin/index.tsx
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { verifySession } from '@/lib/auth';
import { readSiteData } from '@/lib/data';
import type { SiteData } from '@/types';

interface AdminPageProps {
  authenticated: boolean;
  initialData: SiteData | null;
}

export default function AdminPage({ authenticated: ssrAuth, initialData: ssrData }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(ssrAuth);
  const [data, setData] = useState<SiteData | null>(ssrData);
  const [checking, setChecking] = useState(!ssrAuth);

  // Client-side auth check: SSR may report not-authenticated on EdgeOne
  // because it can't self-fetch edge functions. Verify via browser API.
  useEffect(() => {
    if (ssrAuth) return; // Already authenticated from SSR
    (async () => {
      try {
        const res = await fetch('/api/auth/check', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json.authenticated) {
            setIsAuthenticated(true);
            // Fetch data client-side
            const dataRes = await fetch('/api/site');
            if (dataRes.ok) {
              setData(await dataRes.json());
            }
          }
        }
      } catch { /* stay on login page */ }
      setChecking(false);
    })();
  }, [ssrAuth]);

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888', fontSize: '14px' }}>
        加载中...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>后台管理 - 湖北文理学院 音乐与舞蹈学院</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {isAuthenticated && data ? (
        <AdminDashboard
          initialData={data}
          onLogout={() => {
            setIsAuthenticated(false);
            setData(null);
          }}
        />
      ) : (
        <AdminLogin onLogin={() => {
          setIsAuthenticated(true);
          window.location.reload();
        }} />
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authenticated = await verifySession(context.req);
  const initialData = authenticated ? await readSiteData(context.req) : null;

  return {
    props: {
      authenticated,
      initialData,
    },
  };
};
