// src/pages/index.tsx
import type { GetServerSideProps } from 'next';

export default function Home() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/course/chorus-conducting',
      permanent: false,
    },
  };
};
