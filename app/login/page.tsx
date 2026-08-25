'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Home from '../page';

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('next');
  return <Home defaultAuth="login" redirectUrl={redirectUrl} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-medium">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

