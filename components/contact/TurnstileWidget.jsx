'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

const TURNSTILE_SCRIPT_LOAD_TIMEOUT_MS = 15000;
const TURNSTILE_WIDGET_VERIFY_DELAY_MS = 4000;

const isTurnstileWidgetVisible = (container) => {
  if (!container) {
    return false;
  }

  const iframe = container.querySelector('iframe');

  if (iframe && iframe.offsetHeight > 0) {
    return true;
  }

  return container.childElementCount > 0 && container.offsetHeight > 0;
};

export const TurnstileWidget = ({ onVerify, onExpire, onUnavailable }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const unavailableReportedRef = useRef(false);
  const tokenReceivedRef = useRef(false);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const reportUnavailable = () => {
      if (unavailableReportedRef.current) {
        return;
      }

      unavailableReportedRef.current = true;
      onUnavailable?.();
    };

    if (!siteKey) {
      reportUnavailable();
      return undefined;
    }

    if (!containerRef.current) {
      return undefined;
    }

    let loadTimeoutId = null;
    let verifyTimeoutId = null;

    const clearLoadTimeout = () => {
      if (loadTimeoutId !== null) {
        clearTimeout(loadTimeoutId);
        loadTimeoutId = null;
      }
    };

    const clearVerifyTimeout = () => {
      if (verifyTimeoutId !== null) {
        clearTimeout(verifyTimeoutId);
        verifyTimeoutId = null;
      }
    };

    const scheduleWidgetVerification = () => {
      clearVerifyTimeout();
      verifyTimeoutId = setTimeout(() => {
        if (unavailableReportedRef.current || tokenReceivedRef.current) {
          return;
        }

        if (!isTurnstileWidgetVisible(containerRef.current)) {
          reportUnavailable();
        }
      }, TURNSTILE_WIDGET_VERIFY_DELAY_MS);
    };

    const removeWidget = () => {
      if (widgetIdRef.current === null || !window.turnstile) {
        widgetIdRef.current = null;
        return;
      }

      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // Widget may already be removed.
      }

      widgetIdRef.current = null;
    };

    const resetWidget = () => {
      tokenReceivedRef.current = false;
      onExpire?.();

      if (widgetIdRef.current === null || !window.turnstile) {
        return;
      }

      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // Widget may already be removed.
      }
    };

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) {
        return;
      }

      removeWidget();

      try {
        const widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          size: 'flexible',
          'refresh-expired': 'auto',
          'refresh-timeout': 'auto',
          callback: (token) => {
            tokenReceivedRef.current = true;
            clearVerifyTimeout();
            onVerify(token);
          },
          'expired-callback': () => {
            resetWidget();
          },
          'error-callback': () => {
            resetWidget();
          },
          'timeout-callback': () => {
            resetWidget();
          },
        });

        if (widgetId === undefined || widgetId === null) {
          reportUnavailable();
          return;
        }

        widgetIdRef.current = widgetId;
        clearLoadTimeout();
        scheduleWidgetVerification();
      } catch {
        reportUnavailable();
      }
    };

    const startLoadTimeout = () => {
      clearLoadTimeout();
      loadTimeoutId = setTimeout(() => {
        if (widgetIdRef.current === null && !tokenReceivedRef.current) {
          reportUnavailable();
        }
      }, TURNSTILE_SCRIPT_LOAD_TIMEOUT_MS);
    };

    const cleanup = () => {
      clearLoadTimeout();
      clearVerifyTimeout();
      removeWidget();
    };

    if (window.turnstile) {
      startLoadTimeout();
      renderWidget();

      return cleanup;
    }

    const existingScript = document.querySelector('script[data-turnstile]');

    if (existingScript) {
      startLoadTimeout();
      existingScript.addEventListener('load', renderWidget);
      existingScript.addEventListener('error', reportUnavailable);

      return () => {
        cleanup();
        existingScript.removeEventListener('load', renderWidget);
        existingScript.removeEventListener('error', reportUnavailable);
      };
    }

    startLoadTimeout();

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.onload = renderWidget;
    script.onerror = reportUnavailable;
    document.head.appendChild(script);

    return () => {
      cleanup();
      script.removeEventListener('load', renderWidget);
      script.removeEventListener('error', reportUnavailable);
    };
  }, [onVerify, onExpire, onUnavailable]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        minWidth: 0,
        minHeight: 65,
        display: 'flex',
        justifyContent: { xs: 'center', sm: 'flex-start' },
        overflow: 'hidden',
      }}
    />
  );
};
