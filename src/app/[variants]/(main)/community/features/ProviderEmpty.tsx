import { Center, Empty, type EmptyProps } from '@lobehub/ui';
import { Cloud } from 'lucide-react';
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

interface ProviderEmptyProps extends Omit<EmptyProps, 'icon'> {
  search?: boolean;
}

const ProviderEmpty = memo<ProviderEmptyProps>(({ search, ...rest }) => {
  const { t } = useTranslation('discover');

  return (
    <Center height="100%" style={styles.style} width="100%">
      <Empty
        description={search ? t('providers.empty.search') : t('providers.empty.description')}
        descriptionProps={{
          fontSize: 14,
        }}
        icon={Cloud}
        style={styles.style1}
        title={search ? undefined : t('providers.empty.title')}
        type={search ? 'default' : 'page'}
        {...rest}
      />
    </Center>
  );
});

ProviderEmpty.displayName = 'ProviderEmpty';

export default ProviderEmpty;
