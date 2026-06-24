import { Suspense } from 'react';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export const metadata = {
  title: 'Admin sign in',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
