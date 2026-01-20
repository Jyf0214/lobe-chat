'use client';

import { Button, Flexbox, FluentEmoji, Highlighter, Text } from '@lobehub/ui';
import { Result } from 'antd';
import { parseAsString, useQueryState } from 'nuqs';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Link from '@/libs/next/Link';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    minWidth: 240,
  },
});

const FailedPage = memo(() => {
  const { t } = useTranslation('oauth');
  const [reason] = useQueryState('reason');
  const [errorMessage] = useQueryState<string>('errorMessage', parseAsString);

  return (
    <Result
      extra={
        <Link href="/public">
          <Button block size={'large'} style={styles.style}>
            {t('error.backToHome')}
          </Button>
        </Link>
      }
      icon={<FluentEmoji emoji={'🥵'} size={96} type={'anim'} />}
      status="error"
      subTitle={
        <Flexbox gap={8}>
          <Text fontSize={16} type="secondary">
            {t('error.desc', {
              reason: t(`error.reason.${reason}` as any, { defaultValue: reason }),
            })}
          </Text>
          {!!errorMessage && <Highlighter language={'log'}>{errorMessage}</Highlighter>}
        </Flexbox>
      }
      title={
        <Text fontSize={32} weight={'bold'}>
          {t('error.title')}
        </Text>
      }
    />
  );
});

FailedPage.displayName = 'FailedPage';

export default FailedPage;
