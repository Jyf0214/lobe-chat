'use client';

import { memo, useEffect } from 'react';

interface UmamiAnalyticsProps {
  scriptUrl: string;
  websiteId?: string;
}

const UmamiAnalytics = memo<UmamiAnalyticsProps>(({ scriptUrl, websiteId }) => {
  useEffect(() => {
    if (!websiteId) return;

    const script = document.createElement('script');
    script.id = 'umami-script';
    script.defer = true;
    script.dataset.websiteId = websiteId;
    script.src = scriptUrl;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('umami-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [scriptUrl, websiteId]);

  return null;
});

export default UmamiAnalytics;
