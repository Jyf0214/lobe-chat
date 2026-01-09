import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { DEFAULT_LANG } from '@/const/locale';
import ClientGlobalLayout from '@/layout/GlobalProvider/ClientGlobalLayout';
import { isMobile } from '@/utils/isMobile';

import ClientRouter from './app/(variants)/router/DesktopClientRouter';

// Assuming existence, or I'll create it/map it

const container = document.getElementById('root');
const root = createRoot(container!);

// Mock server config for client-side
const serverConfig = {
  telemetry: {},
  // Add other necessary defaults here
} as any;

const serverFeatureFlags = {}; // Default flags

root.render(
  <BrowserRouter>
    <ClientGlobalLayout
      isMobile={isMobile}
      locale={DEFAULT_LANG} // You might want to detect this
      serverConfig={serverConfig}
      serverFeatureFlags={serverFeatureFlags}
    >
      <ClientRouter />
    </ClientGlobalLayout>
  </BrowserRouter>,
);
