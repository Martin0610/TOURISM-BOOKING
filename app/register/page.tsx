'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import StaticHomeBackdrop from '@/components/StaticHomeBackdrop';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('next');

  const handleClose = () => {
    if (redirectUrl && redirectUrl.startsWith('/') && redirectUrl !== '/register') {
      router.push(redirectUrl);
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <StaticHomeBackdrop />
      <AuthModal
        isOpen={true}
        initialMode="register"
        onClose={handleClose}
        redirectUrl={redirectUrl}
      />
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-medium">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
