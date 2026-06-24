'use client';

import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Link from 'next/link';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

export const AdminNavLink = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/session');
        const result = await response.json();

        setIsAdmin(result.authenticated === true);
      } catch {
        setIsAdmin(false);
      } finally {
        setHasCheckedSession(true);
      }
    };

    checkAdminSession();
  }, []);

  if (!hasCheckedSession || !isAdmin) {
    return null;
  }

  return (
    <Tooltip title="Admin">
      <IconButton
        component={Link}
        href="/admin"
        color="inherit"
        size="large"
        aria-label="Admin"
      >
        <AdminPanelSettingsOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
};
