'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import StaticHomeBackdrop from '@/components/StaticHomeBackdrop';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('next');

  const handleClose = () => {
    if (redirectUrl && redirectUrl.startsWith('/') && redirectUrl !== '/login') {
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
        initialMode="login"
        onClose={handleClose}
        redirectUrl={redirectUrl}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-medium">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

