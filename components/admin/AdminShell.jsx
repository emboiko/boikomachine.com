'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const AdminShell = ({ children, title = 'Admin', backHref, backLabel = 'Back' }) => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography component="h1" variant="h2">
            {title}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button component="a" href="/" variant="text">
              View site
            </Button>
            {backHref ? (
              <Button component="a" href={backHref} variant="text">
                {backLabel}
              </Button>
            ) : null}
            <Button variant="outlined" onClick={handleLogout}>
              Sign out
            </Button>
          </Stack>
        </Box>
        {children}
      </Stack>
    </Container>
  );
};
