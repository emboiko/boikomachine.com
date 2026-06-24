import { AdminPortfolioPage } from '@/components/admin/AdminPortfolioPage';

export const metadata = {
  title: 'Portfolio admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPortfolioRoutePage() {
  return <AdminPortfolioPage />;
}
