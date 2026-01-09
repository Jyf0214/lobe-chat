'use client';

import { Suspense, lazy } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';

const MobileRouterClient = lazy(() => import('./MobileClientRouter'));

const MobileRouter = () => {
  return (
    <Suspense fallback={<Loading debugId="MobileRouter" />}>
      <MobileRouterClient />
    </Suspense>
  );
};

export default MobileRouter;
