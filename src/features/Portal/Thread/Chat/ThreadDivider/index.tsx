import { Icon, Tag } from '@lobehub/ui';
import { Divider } from 'antd';
import { GitBranch } from 'lucide-react';
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

const ThreadDivider = memo(() => {
  const { t } = useTranslation('chat');

  return (
    <div style={styles.spacing}>
      <Divider style={styles.spacing1}>
        <Tag icon={<Icon icon={GitBranch} />}>{t('thread.divider')}</Tag>
      </Divider>
    </div>
  );
});

export default ThreadDivider;
