'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { AdminShell } from '@/components/admin/AdminShell';
import { PortfolioItemForm } from '@/components/admin/PortfolioItemForm';
import {
  deleteAdminPortfolioItem,
  fetchAdminPortfolioItem,
  updateAdminPortfolioItem,
} from '@/services/client/adminPortfolioClientService';

export const AdminPortfolioEditPage = ({ itemId }) => {
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const portfolioItem = await fetchAdminPortfolioItem(itemId);
        setItem(portfolioItem);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load portfolio item.');
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  const handleSubmit = async (payload) => {
    const updatedItem = await updateAdminPortfolioItem(itemId, payload);
    setItem(updatedItem);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this portfolio project? This cannot be undone.');

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage('');

    try {
      await deleteAdminPortfolioItem(itemId);
      router.replace('/admin/portfolio');
      router.refresh();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete portfolio item.');
      setIsDeleting(false);
    }
  };

  return (
    <AdminShell title="Edit portfolio project" backHref="/admin/portfolio" backLabel="Portfolio list">
      {errorMessage ? <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert> : null}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!isLoading && item ? (
        <PortfolioItemForm
          initialItem={item}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      ) : null}

      {!isLoading && !item && !errorMessage ? (
        <Alert severity="warning">Portfolio project not found.</Alert>
      ) : null}
    </AdminShell>
  );
};
