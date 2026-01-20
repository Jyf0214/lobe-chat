import { Center, Empty, type EmptyProps } from '@lobehub/ui';
import { FileText } from 'lucide-react';
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

interface PageEmptyProps extends Omit<EmptyProps, 'icon'> {
  search?: boolean;
}

const PageEmpty = memo<PageEmptyProps>(({ search, ...rest }) => {
  const { t } = useTranslation('file');

  return (
    <Center height="100%" style={styles.style} width="100%">
      <Empty
        description={search ? t('pageList.noResults') : t('pageList.empty')}
        descriptionProps={{
          fontSize: 14,
        }}
        icon={FileText}
        style={styles.style1}
        {...rest}
      />
    </Center>
  );
});

PageEmpty.displayName = 'PageEmpty';

export default PageEmpty;
