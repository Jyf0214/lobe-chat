import { Flexbox, Icon } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { Loader2, type LucideIcon } from 'lucide-react';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    color: cssVar.colorTextDescription,
    fontSize: 12,
  },
  style: {
    fontWeight: 'bold',
  },
});

const TimeLabel = memo<{
  date?: string;
  icon: LucideIcon;
  title: string;
}>(({ date, icon, title }) => {
  return (
    <Flexbox align={'center'} gap={4} horizontal style={styles.colored}>
      <Icon icon={icon} />
      {title}: {date ? <span style={styles.style}>{date}</span> : <Icon icon={Loader2} spin />}
    </Flexbox>
  );
});

export default TimeLabel;
