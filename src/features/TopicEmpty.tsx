import { Center, Empty, type EmptyProps } from '@lobehub/ui';
import { MessageSquareText } from 'lucide-react';
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

interface TopicEmptyProps extends Omit<EmptyProps, 'icon'> {
  search?: boolean;
}

const TopicEmpty = memo<TopicEmptyProps>(({ search, ...rest }) => {
  const { t } = useTranslation('topic');

  return (
    <Center height="100%" style={styles.style} width="100%">
      <Empty
        description={search ? t('searchResultEmpty') : t('guide.desc')}
        descriptionProps={{
          fontSize: 14,
        }}
        icon={MessageSquareText}
        style={styles.style1}
        {...rest}
      />
    </Center>
  );
});

TopicEmpty.displayName = 'TopicEmpty';

export default TopicEmpty;
