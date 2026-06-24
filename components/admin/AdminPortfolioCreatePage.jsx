'use client';

import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { PortfolioItemForm } from '@/components/admin/PortfolioItemForm';
import { createAdminPortfolioItem } from '@/services/client/adminPortfolioClientService';

export const AdminPortfolioCreatePage = () => {
  const router = useRouter();

  const handleSubmit = async (payload) => {
    await createAdminPortfolioItem(payload);
    router.replace('/admin/portfolio');
    router.refresh();
  };

  return (
    <AdminShell
      title="New portfolio project"
      backHref="/admin/portfolio"
      backLabel="Portfolio list"
    >
      <PortfolioItemForm onSubmit={handleSubmit} />
    </AdminShell>
  );
};
