'use client';

import { SiDiscord } from '@icons-pack/react-simple-icons';
import { SOCIAL_URL } from '@lobechat/business-const';
import { Alert, Button, Flexbox, Icon } from '@lobehub/ui';
import { parseAsString, useQueryState } from 'nuqs';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import AuthCard from '@/features/AuthCard';
import Link from '@/libs/next/Link';

const normalizeErrorCode = (code?: string | null) =>
  (code || 'UNKNOWN').trim().toUpperCase().replaceAll('-', '_');

const AuthErrorPage = memo(() => {
  const { t } = useTranslation('authError');
  const [error] = useQueryState('error', parseAsString);

  const code = normalizeErrorCode(error);
  const description = t(`codes.${code}`, { defaultValue: t('codes.UNKNOWN') });

  return (
    <AuthCard
      footer={
        <Flexbox gap={12} justify="center" width="100%" wrap="wrap">
          <Link href="/signin" style={{ width: '100%' }}>
            <Button block size={'large'} type="primary">
              {t('actions.retry')}
            </Button>
          </Link>
          <Link href="/" style={{ width: '100%' }}>
            <Button block size={'large'}>
              {t('actions.home')}
            </Button>
          </Link>
          <Link
            href={SOCIAL_URL.discord}
            rel="noopener noreferrer"
            style={{ width: '100%' }}
            target="_blank"
          >
            <Button block icon={<Icon icon={SiDiscord} />} type="text">
              {t('actions.discord')}
            </Button>
          </Link>
        </Flexbox>
      }
      subtitle={description}
      title={t('title')}
    >
      <Alert title={error || 'UNKNOWN'} type={'error'} />
    </AuthCard>
  );
});

AuthErrorPage.displayName = 'AuthErrorPage';

export default AuthErrorPage;
