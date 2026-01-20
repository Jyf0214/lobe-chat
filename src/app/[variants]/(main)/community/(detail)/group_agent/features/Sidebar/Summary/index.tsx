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

  const displayDescription = summary || description || 'No description provided';

  return (
    <Collapse
      defaultActiveKey={['summary']}
      expandIconPlacement={'end'}
      items={[
        {
          children: <p style={styles.spacing}>{displayDescription}</p>,
          key: 'summary',
          label: t('groupAgents.details.summary.title', {
            defaultValue: 'What can you use this group for?',
          }),
        },
      ]}
      size={'small'}
      variant={'borderless'}
    />
  );
});

export default Summary;
