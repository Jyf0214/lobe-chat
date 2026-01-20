import { useTimeout } from 'ahooks';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    cursor: 'pointer',
    fontSize: 12,
  },
});

const RedirectLogin = memo<{ timeout: number }>(({ timeout = 2000 }) => {
  const signIn = useUserStore((s) => s.openLogin);
  const { t } = useTranslation('error');

  useTimeout(() => {
    signIn();
  }, timeout);

  return <div style={styles.style}>{t('loginRequired.desc')}</div>;
});

export default RedirectLogin;
