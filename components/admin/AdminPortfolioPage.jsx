'use client';

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { PortfolioItemList } from '@/components/admin/PortfolioItemList';
import { fetchAdminPortfolioItems } from '@/services/client/adminPortfolioClientService';

export const AdminPortfolioPage = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadItems = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const portfolioItems = await fetchAdminPortfolioItems();

        if (!isCancelled) {
          setItems(portfolioItems);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || 'Failed to load portfolio items.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <AdminShell title="Portfolio" backHref="/admin" backLabel="Admin home">
      <Stack spacing={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Manage public portfolio projects by category, photos, and optional video links.
          </Typography>
          <Button component={Link} href="/admin/portfolio/new" variant="contained">
            New project
          </Button>
        </Box>

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <PortfolioItemList items={items} />
        )}
      </Stack>
    </AdminShell>
  );
};
