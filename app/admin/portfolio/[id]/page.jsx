import { AdminPortfolioEditPage } from '@/components/admin/AdminPortfolioEditPage';

export const metadata = {
  title: 'Edit portfolio project',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPortfolioEditRoutePage({ params }) {
  const { id } = await params;

  return <AdminPortfolioEditPage itemId={id} />;
}
