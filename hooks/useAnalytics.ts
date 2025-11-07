import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Basic check to avoid tracking during local development if needed
    if (window.location.hostname === 'localhost') {
      return;
    }

    const trackPageView = async () => {
      try {
        await fetch('/api/event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: location.pathname,
            referrer: document.referrer,
          }),
        });
      } catch (error) {
        // We fail silently to not affect the user experience.
        console.warn('Analytics tracking failed:', error);
      }
    };

    // Use a small delay to ensure it doesn't block the main thread during page load.
    const timeoutId = setTimeout(trackPageView, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]); // Re-run effect if the path changes
}