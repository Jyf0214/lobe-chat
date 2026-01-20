import { Center, Empty, type EmptyProps } from '@lobehub/ui';
import { Boxes } from 'lucide-react';
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

interface McpEmptyProps extends Omit<EmptyProps, 'icon'> {
  search?: boolean;
}

const McpEmpty = memo<McpEmptyProps>(({ search, ...rest }) => {
  const { t } = useTranslation('discover');

  return (
    <Center height="100%" style={styles.style} width="100%">
      <Empty
        description={search ? t('mcpEmpty.search') : t('mcpEmpty.description')}
        descriptionProps={{
          fontSize: 14,
        }}
        icon={Boxes}
        style={styles.style1}
        title={search ? undefined : t('mcpEmpty.title')}
        type={search ? 'default' : 'page'}
        {...rest}
      />
    </Center>
  );
});

McpEmpty.displayName = 'McpEmpty';

export default McpEmpty;
