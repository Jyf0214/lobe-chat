import { Center, Empty, type EmptyProps } from '@lobehub/ui';
import { Bot } from 'lucide-react';
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

interface AssistantEmptyProps extends Omit<EmptyProps, 'icon'> {
  search?: boolean;
}

const AssistantEmpty = memo<AssistantEmptyProps>(({ search, ...rest }) => {
  const { t } = useTranslation('discover');

  return (
    <Center height="100%" style={styles.style} width="100%">
      <Empty
        description={search ? t('assistants.empty.search') : t('assistants.empty.description')}
        descriptionProps={{
          fontSize: 14,
        }}
        icon={Bot}
        style={styles.style1}
        title={search ? undefined : t('assistants.empty.title')}
        type={search ? 'default' : 'page'}
        {...rest}
      />
    </Center>
  );
});

AssistantEmpty.displayName = 'AssistantEmpty';

export default AssistantEmpty;
