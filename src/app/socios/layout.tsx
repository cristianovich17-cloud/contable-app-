'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function SociosLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return children;
}
