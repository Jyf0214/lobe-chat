import { ENABLE_BUSINESS_FEATURES } from '@lobechat/business-const';
import { ContextMenuHost, ModalHost, TooltipGroup } from '@lobehub/ui';
import { LazyMotion, domMax } from 'motion/react';
import { type ReactNode, Suspense } from 'react';

import { ReferralProvider } from '@/business/client/ReferralProvider';
import { LobeAnalyticsProviderWrapper } from '@/components/Analytics/LobeAnalyticsProviderWrapper';
import { DragUploadProvider } from '@/components/DragUploadZone/DragUploadProvider';
import { ServerConfigStoreProvider } from '@/store/serverConfig/Provider';
import { type GlobalServerConfig } from '@/types/serverConfig';

import AppTheme from './AppTheme';
import ClientStyleRegistry from './ClientStyleRegistry';
import { GroupWizardProvider } from './GroupWizardProvider';
import ImportSettings from './ImportSettings';
import Locale from './Locale';
import NextThemeProvider from './NextThemeProvider';
import QueryProvider from './Query';
import StoreInitialization from './StoreInitialization';

interface ClientGlobalLayoutProps {
  antdLocale?: any;
  children: ReactNode;
  isMobile?: boolean;
  locale: string;
  neutralColor?: string;
  primaryColor?: string;
  serverConfig?: GlobalServerConfig;
  serverFeatureFlags?: any;
  variants?: string;
}

const ClientGlobalLayout = ({
  children,
  neutralColor,
  primaryColor,
  locale: userLocale,
  isMobile,
  variants,
  serverConfig = {} as any,
  serverFeatureFlags = {},
  antdLocale,
}: ClientGlobalLayoutProps) => {
  return (
    <ClientStyleRegistry>
      <Locale antdLocale={antdLocale} defaultLang={userLocale}>
        <NextThemeProvider>
          <AppTheme
            customFontFamily={process.env.VITE_APP_CUSTOM_FONT_FAMILY}
            customFontURL={process.env.VITE_APP_CUSTOM_FONT_URL}
            defaultNeutralColor={neutralColor as any}
            defaultPrimaryColor={primaryColor as any}
            globalCDN={process.env.VITE_APP_CDN_USE_GLOBAL === '1'}
          >
            <ServerConfigStoreProvider
              featureFlags={serverFeatureFlags}
              isMobile={isMobile}
              segmentVariants={variants}
              serverConfig={serverConfig}
            >
              <QueryProvider>
                <GroupWizardProvider>
                  <DragUploadProvider>
                    <LazyMotion features={domMax}>
                      <TooltipGroup layoutAnimation={false}>
                        <LobeAnalyticsProviderWrapper>{children}</LobeAnalyticsProviderWrapper>
                      </TooltipGroup>
                      <ModalHost />
                      <ContextMenuHost />
                    </LazyMotion>
                  </DragUploadProvider>
                </GroupWizardProvider>
              </QueryProvider>
              <StoreInitialization />
              <Suspense>
                {ENABLE_BUSINESS_FEATURES ? <ReferralProvider /> : null}
                <ImportSettings />
              </Suspense>
            </ServerConfigStoreProvider>
          </AppTheme>
        </NextThemeProvider>
      </Locale>
    </ClientStyleRegistry>
  );
};

export default ClientGlobalLayout;
