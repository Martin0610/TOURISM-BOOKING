'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Home from '../page';

function RegisterContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('next');
  return <Home defaultAuth="register" redirectUrl={redirectUrl} />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-medium">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
