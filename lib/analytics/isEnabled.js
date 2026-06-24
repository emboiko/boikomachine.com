const getExplicitOverride = () => {
  const value = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED;

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
};

/**
 * Custom analytics (GA4 + MongoDB events) run only on Vercel production by default.
 * Set NEXT_PUBLIC_ANALYTICS_ENABLED=true in .env.local to test locally.
 */
export const isAnalyticsEnabled = () => {
  const override = getExplicitOverride();

  if (override !== undefined) {
    return override;
  }

  const vercelEnv =
    process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || '';

  if (vercelEnv) {
    return vercelEnv === 'production';
  }

  return false;
};
