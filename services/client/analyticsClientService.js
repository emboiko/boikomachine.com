import { isAnalyticsEnabled } from '@/lib/analytics/isEnabled';

const SESSION_STORAGE_KEY = 'boikomachine_session_id';

const getSessionId = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  let sessionId = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }

  return sessionId;
};

export const trackAnalyticsEvent = async ({ type, path, metadata }) => {
  if (typeof window === 'undefined' || !isAnalyticsEnabled()) {
    return;
  }

  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        type,
        path,
        metadata,
        sessionId: getSessionId(),
      }),
    });
  } catch {
    // Analytics should never block user actions.
  }
};

export const trackPageView = (path) => {
  return trackAnalyticsEvent({
    type: 'page_view',
    path,
  });
};

export const trackCtaClick = (path, metadata) => {
  return trackAnalyticsEvent({
    type: 'cta_click',
    path,
    metadata,
  });
};

export const trackPortfolioView = (path, metadata) => {
  return trackAnalyticsEvent({
    type: 'portfolio_view',
    path,
    metadata,
  });
};

export const trackFormSubmit = (path) => {
  return trackAnalyticsEvent({
    type: 'form_submit',
    path,
  });
};

export const sendGaEvent = (eventName, params) => {
  if (
    typeof window === 'undefined' ||
    !isAnalyticsEnabled() ||
    typeof window.gtag !== 'function'
  ) {
    return;
  }

  window.gtag('event', eventName, params);
};
