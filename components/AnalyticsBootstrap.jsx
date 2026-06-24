'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/services/client/analyticsClientService';

export const AnalyticsBootstrap = () => {
  useEffect(() => {
    trackPageView(window.location.pathname + window.location.hash);
  }, []);

  return null;
};
