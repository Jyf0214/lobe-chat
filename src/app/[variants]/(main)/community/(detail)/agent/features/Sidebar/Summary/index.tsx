import { Collapse } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

import { useDetailContext } from '../../DetailProvider';

const styles = StyleSheet.create({
  spacing: {
    color: cssVar.colorTextSecondary,
    margin: 0,
  },
});

const Summary = memo(() => {
  const { description, summary } = useDetailContext();
  const { t } = useTranslation('discover');
  return (
    <Collapse
      defaultActiveKey={['summary']}
      expandIconPlacement={'end'}
      items={[
        {
          children: <p style={styles.spacing}>{summary || description}</p>,
          key: 'summary',
          label: t('assistants.details.summary.title'),
        },
      ]}
      size={'small'}
      variant={'borderless'}
    />
  );
});

export default Summary;
