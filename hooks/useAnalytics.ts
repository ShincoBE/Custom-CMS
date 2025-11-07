import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'cookie_consent';

const hasConsent = () => {
    // Return true only if explicitly accepted. Null/declined are treated as no consent.
    return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
}

const getUniqueId = () => {
  let uniqueId = localStorage.getItem('visitor_id');
  if (!uniqueId) {
    uniqueId = crypto.randomUUID();
    localStorage.setItem('visitor_id', uniqueId);
  }
  return uniqueId;
};

const track = (type: 'pageview' | 'event', data: Record<string, any>) => {
  // Check for consent before tracking anything.
  if (!hasConsent() || window.location.hostname === 'localhost') {
    return;
  }
  
  const payload = {
    type,
    uniqueId: getUniqueId(),
    path: window.location.pathname,
    referrer: document.referrer,
    ...data,
  };

  try {
    // Use sendBeacon for reliability, especially for events fired during page unload.
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/event', blob);
    } else {
      fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true, // Ensures request is sent even if the page is unloading.
      }).catch(error => {
        console.warn('Analytics tracking failed:', error);
      });
    }
  } catch (error) {
     console.warn('Analytics tracking failed:', error);
  }
};

// Exported function to be called from the consent banner to fire initial track.
export const trackPageview = () => {
  track('pageview', {});
};

// Exported function for components to track specific, non-pageview events.
export const trackEvent = (name: string, detail: string) => {
  track('event', { eventName: name, eventDetail: detail });
};

// Hook for automatically tracking page views on route changes.
export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    trackPageview();
  }, [location.pathname]);
}
