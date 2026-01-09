'use client';

import { Suspense, lazy } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';

const DesktopRouterClient = lazy(() => import('./DesktopClientRouter'));

const DesktopRouter = () => {
  return (
    <Suspense fallback={<Loading debugId="DesktopRouter" />}>
      <DesktopRouterClient />
    </Suspense>
  );
};

export default DesktopRouter;
