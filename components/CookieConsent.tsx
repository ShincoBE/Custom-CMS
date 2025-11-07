import React, { useState, useEffect } from 'react';
import { trackPageview } from '../hooks/useAnalytics';

const COOKIE_CONSENT_KEY = 'cookie_consent';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consentStatus = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consentStatus) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? 'accepted' : 'declined');
    setIsVisible(false);
    if (accepted) {
      // Fire the initial pageview since analytics were blocked until now.
      trackPageview(); 
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 animate-slide-up" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title">
      <div className="max-w-7xl mx-auto bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 rounded-lg shadow-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-zinc-300">
          <h2 id="cookie-consent-title" className="font-bold text-white">Wij gebruiken cookies</h2>
          <p className="mt-1">
            Deze website gebruikt cookies om het gebruik te analyseren en de gebruikerservaring te verbeteren. 
            Door te accepteren geeft u toestemming voor het plaatsen van deze cookies.
          </p>
        </div>
        <div className="flex-shrink-0 flex gap-3">
          <button
            onClick={() => handleConsent(false)}
            className="px-5 py-2 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600 transition-colors"
          >
            Weigeren
          </button>
          <button
            onClick={() => handleConsent(true)}
            className="px-5 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;