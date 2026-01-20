import { Flexbox, Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

import ArtifactList from './ArtifactList';

const styles = StyleSheet.create({
  spacing: {
    marginInline: 12,
  },
});

export const Artifacts = memo(() => {
  const { t } = useTranslation('portal');

  return (
    <Flexbox gap={8}>
      <Text as={'h5'} style={styles.spacing}>
        {t('Plugins')}
      </Text>
      <ArtifactList />
    </Flexbox>
  );
});

export default Artifacts;
