import { Flexbox, Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

import FileList from './FileList';

const styles = StyleSheet.create({
  spacing: {
    marginInline: 12,
  },
});

export const Files = memo(() => {
  const { t } = useTranslation('portal');

  return (
    <Flexbox gap={8}>
      <Text as={'h5'} style={styles.spacing}>
        {t('files')}
      </Text>
      <FileList />
    </Flexbox>
  );
});

export default Files;
