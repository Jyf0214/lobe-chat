'use client';

import { ENABLE_BUSINESS_FEATURES } from '@lobechat/business-const';
import { type ReactNode, Suspense, useEffect } from 'react';
import { isRtlLang } from 'rtl-detect';

import BusinessGlobalProvider from '@/business/client/BusinessGlobalProvider';
import { DEFAULT_LANG } from '@/const/locale';
import PWAInstall from '@/features/PWAInstall';
import AuthProvider from '@/layout/AuthProvider';
import GlobalProvider from '@/layout/GlobalProvider';
import { useGlobalStore } from '@/store/global';

export interface RootLayoutProps {
  children: ReactNode;
  isMobile?: boolean;
  locale?: string;
  neutralColor?: string;
  primaryColor?: string;
  variants?: string;
}

const RootLayout = ({
  children,
  isMobile = false,
  locale = DEFAULT_LANG,
  neutralColor,
  primaryColor,
  variants = '',
}: RootLayoutProps) => {
  const direction = isRtlLang(locale) ? 'rtl' : 'ltr';

  // Set document direction and lang on client side
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
  }, [direction, locale]);

  // Load React Scan in debug mode
  useEffect(() => {
    if (process.env.DEBUG_REACT_SCAN === '1') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/react-scan/dist/auto.global.js';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  const renderContent = () => {
    return (
      <GlobalProvider
        isMobile={isMobile}
        locale={locale}
        neutralColor={neutralColor}
        primaryColor={primaryColor}
        variants={variants}
      >
        <AuthProvider>{children}</AuthProvider>
        <Suspense fallback={null}>
          <PWAInstall />
        </Suspense>
      </GlobalProvider>
    );
  };

  return ENABLE_BUSINESS_FEATURES ? (
    <BusinessGlobalProvider>{renderContent()}</BusinessGlobalProvider>
  ) : (
    renderContent()
  );
};

export default RootLayout;
