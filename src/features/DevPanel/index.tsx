'use client';

import { BookText, Cog, FlagIcon, GlobeLockIcon } from 'lucide-react';
import { Suspense, lazy } from 'react';

import CacheViewer from './CacheViewer';
import FeatureFlagViewer from './FeatureFlagViewer';
import MetadataViewer from './MetadataViewer';
import SystemInspector from './SystemInspector';

const FloatPanel = lazy(() => import('./features/FloatPanel'));

const DevPanel = () => (
  <Suspense fallback={null}>
    <FloatPanel
      items={[
        // ...(isDesktop
        //   ? [
        //       {
        //         children: <PostgresViewer />,
        //         icon: <DatabaseIcon size={16} />,
        //         key: 'Postgres Viewer',
        //       },
        //     ]
        //   : []),
        {
          children: <MetadataViewer />,
          icon: <BookText size={16} />,
          key: 'SEO Metadata',
        },
        {
          children: <CacheViewer />,
          icon: <GlobeLockIcon size={16} />,
          key: 'NextJS Caches',
        },
        {
          children: <FeatureFlagViewer />,
          icon: <FlagIcon size={16} />,
          key: 'Feature Flags',
        },
        {
          children: <SystemInspector />,
          icon: <Cog size={16} />,
          key: 'System Status',
        },
      ]}
    />
  </Suspense>
);

export default DevPanel;
