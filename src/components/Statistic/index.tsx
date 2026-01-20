import { Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { type ReactNode, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    color: cssVar.colorTextDescription,
    fontSize: 12,
  },
  style: {
    fontWeight: 'bold',
  },
  style1: {
    fontWeight: 'normal',
  },
});

const Statistic = memo<{ title: ReactNode; value: ReactNode }>(({ value, title }) => {
  return (
    <Flexbox gap={4} horizontal style={styles.colored}>
      <span style={styles.style}>{value}</span>
      <span style={styles.style1}>{title}</span>
    </Flexbox>
  );
});

export default Statistic;
