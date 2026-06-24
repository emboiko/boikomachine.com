import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <AdminShell>
      <Typography variant="body1" color="text.secondary">
        Submission and portfolio tools will live here. A session is required to view contact attachments.
      </Typography>
    </AdminShell>
  );
}
