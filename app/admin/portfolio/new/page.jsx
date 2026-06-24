import { AdminPortfolioCreatePage } from '@/components/admin/AdminPortfolioCreatePage';

export const metadata = {
  title: 'New portfolio project',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPortfolioNewPage() {
  return <AdminPortfolioCreatePage />;
}
