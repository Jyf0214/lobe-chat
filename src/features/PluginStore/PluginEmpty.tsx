import { Center, Empty, type EmptyProps } from '@lobehub/ui';
import { Plug2 } from 'lucide-react';
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

interface PluginEmptyProps extends Omit<EmptyProps, 'icon'> {
  search?: boolean;
}

const PluginEmpty = memo<PluginEmptyProps>(({ search, ...rest }) => {
  const { t } = useTranslation('plugin');

  return (
    <Center height="100%" style={styles.style} width="100%">
      <Empty
        description={search ? t('empty.search') : t('empty.description')}
        descriptionProps={{
          fontSize: 14,
        }}
        icon={Plug2}
        style={styles.style1}
        {...rest}
      />
    </Center>
  );
});

PluginEmpty.displayName = 'PluginEmpty';

export default PluginEmpty;
