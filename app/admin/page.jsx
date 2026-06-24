import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
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
      <Stack spacing={3}>
        <Typography variant="body1" color="text.secondary">
          Internal tools for Boiko Machine &amp; Tool.
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h3" sx={{ fontSize: '1.125rem' }}>
                Portfolio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and edit portfolio projects, photos, and category assignments shown on the
                public site.
              </Typography>
              <Button component={Link} href="/admin/portfolio" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                Manage portfolio
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </AdminShell>
  );
}
