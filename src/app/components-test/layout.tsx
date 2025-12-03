'use client';
import TermsModal from '@/components/common/TermsModal';
import AppLayout from '@/components/layout/AppLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppLayout>{children}</AppLayout>
      <TermsModal />
    </>
  );
}
