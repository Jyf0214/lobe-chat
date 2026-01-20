import { Center, Empty, type EmptyProps } from '@lobehub/ui';
import { BrainCircuitIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    minHeight: '50vh',
  },
  style1: {
    maxWidth: 400,
  },
});

const MemoryEmpty = memo<EmptyProps & { search?: boolean }>(({ search, title, ...rest }) => {
  const { t } = useTranslation('memory');
  return (
    <Center height="100%" style={styles.style} width="100%">
      <Empty
        description={search ? t('empty.search') : t('empty.description')}
        descriptionProps={{
          fontSize: 14,
        }}
        icon={BrainCircuitIcon}
        style={styles.style1}
        title={search ? undefined : title || t('empty.title')}
        type={search ? 'default' : 'page'}
        {...rest}
      />
    </Center>
  );
});

export default MemoryEmpty;
