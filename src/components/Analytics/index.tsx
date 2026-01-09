import { Suspense, lazy } from 'react';

import { isDesktop } from '@/const/version';
import { analyticsEnv } from '@/envs/analytics';

import Desktop from './Desktop';
import Google from './Google';
import Vercel from './Vercel';

const Plausible = lazy(() => import('./Plausible'));
const Umami = lazy(() => import('./Umami'));
const Clarity = lazy(() => import('./Clarity'));
const ReactScan = lazy(() => import('./ReactScan'));

const Analytics = () => {
  return (
    <>
      {analyticsEnv.ENABLE_VERCEL_ANALYTICS && <Vercel />}
      {analyticsEnv.ENABLE_GOOGLE_ANALYTICS && <Google />}
      {analyticsEnv.ENABLED_PLAUSIBLE_ANALYTICS && (
        <Suspense fallback={null}>
          <Plausible
            domain={analyticsEnv.PLAUSIBLE_DOMAIN}
            scriptBaseUrl={analyticsEnv.PLAUSIBLE_SCRIPT_BASE_URL}
          />
        </Suspense>
      )}
      {analyticsEnv.ENABLED_UMAMI_ANALYTICS && (
        <Suspense fallback={null}>
          <Umami
            scriptUrl={analyticsEnv.UMAMI_SCRIPT_URL}
            websiteId={analyticsEnv.UMAMI_WEBSITE_ID}
          />
        </Suspense>
      )}
      {analyticsEnv.ENABLED_CLARITY_ANALYTICS && (
        <Suspense fallback={null}>
          <Clarity projectId={analyticsEnv.CLARITY_PROJECT_ID} />
        </Suspense>
      )}
      {!!analyticsEnv.REACT_SCAN_MONITOR_API_KEY && (
        <Suspense fallback={null}>
          <ReactScan apiKey={analyticsEnv.REACT_SCAN_MONITOR_API_KEY} />
        </Suspense>
      )}
      {isDesktop && <Desktop />}
    </>
  );
};

export default Analytics;
