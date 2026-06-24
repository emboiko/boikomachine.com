'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export const AdminLoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || 'Sign in failed.');
        setIsSubmitting(false);
        return;
      }

      if (returnTo && returnTo.startsWith('/')) {
        router.replace(returnTo);
        router.refresh();
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setErrorMessage('Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <Box>
          <Typography component="h1" variant="h2" sx={{ mb: 1 }}>
            Admin sign in
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Internal access for Boiko Machine &amp; Tool.
          </Typography>
        </Box>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          fullWidth
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          disabled={isSubmitting}
        />

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </Stack>
    </Container>
  );
};
