'use client';

import { memo, useEffect } from 'react';
import urlJoin from 'url-join';

const DesktopAnalytics = memo(() => {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_DESKTOP_PROJECT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_DESKTOP_UMAMI_BASE_URL;

    if (!projectId || !baseUrl) return;

    const script = document.createElement('script');
    script.id = 'desktop-analytics-script';
    script.defer = true;
    script.dataset.websiteId = projectId;
    script.src = urlJoin(baseUrl, 'script.js');
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('desktop-analytics-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
});

export default DesktopAnalytics;
