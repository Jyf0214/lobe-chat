'use client';

import { Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    fontSize: 16,
  },
});

const Title = memo(() => {
  const { t } = useTranslation('portal');

  return (
    <Text style={styles.style} type={'secondary'}>
      {t('title')}
    </Text>
  );
});

export default Title;
