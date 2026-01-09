'use client';

import { memo, useEffect } from 'react';

interface PlausibleAnalyticsProps {
  domain?: string;
  scriptBaseUrl: string;
}

const PlausibleAnalytics = memo<PlausibleAnalyticsProps>(({ domain, scriptBaseUrl }) => {
  useEffect(() => {
    if (!domain) return;

    const script = document.createElement('script');
    script.id = 'plausible-script';
    script.defer = true;
    script.dataset.domain = domain;
    script.src = `${scriptBaseUrl}/js/script.js`;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('plausible-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [domain, scriptBaseUrl]);

  return null;
});

export default PlausibleAnalytics;
