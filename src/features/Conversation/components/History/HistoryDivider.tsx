import { Icon, Tag } from '@lobehub/ui';
import { Divider } from 'antd';
import { Timer } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    padding: '0 20px',
  },
  spacing1: {
    margin: 0,
    padding: '20px 0',
  },
});

interface HistoryDividerProps {
  enable?: boolean;
}

const HistoryDivider = memo<HistoryDividerProps>(({ enable }) => {
  const { t } = useTranslation('common');
  if (!enable) return null;

  return (
    <div style={styles.spacing}>
      <Divider style={styles.spacing1}>
        <Tag icon={<Icon icon={Timer} />}>{t('historyRange')}</Tag>
      </Divider>
    </div>
  );
});

export default HistoryDivider;
