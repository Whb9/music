// src/pages/admin/index.tsx
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { verifySession } from '@/lib/auth';
import { readSiteData } from '@/lib/data';
import type { SiteData } from '@/types';

interface AdminPageProps {
  authenticated: boolean;
  initialData: SiteData | null;
}

export default function AdminPage({ authenticated, initialData }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(authenticated);

  return (
    <>
      <Head>
        <title>后台管理 - 湖北文理学院 音乐与舞蹈学院</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {isAuthenticated && initialData ? (
        <AdminDashboard
          initialData={initialData}
          onLogout={() => setIsAuthenticated(false)}
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
