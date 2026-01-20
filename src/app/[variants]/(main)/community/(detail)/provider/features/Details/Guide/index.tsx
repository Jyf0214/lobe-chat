import { Block, Empty } from '@lobehub/ui';
import { Mdx } from '@lobehub/ui/mdx';
import { BookOpen } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

import { useDetailContext } from '../../DetailProvider';

const styles = StyleSheet.create({
  style: {
    maxWidth: 400,
  },
});

const Guide = memo(() => {
  const { t } = useTranslation('discover');
  const { readme = '' } = useDetailContext();

  if (!readme)
    return (
      <Block variant={'outlined'}>
        <Empty
          description={t('providers.details.guide.title')}
          descriptionProps={{ fontSize: 14 }}
          icon={BookOpen}
          style={styles.style}
        />
      </Block>
    );

  return (
    <Mdx enableImageGallery={false} enableLatex={false} fontSize={14} headerMultiple={0.3}>
      {readme}
    </Mdx>
  );
});

export default Guide;
