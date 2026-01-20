import { Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';

import { useIsDark } from '@/hooks/useIsDark';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    borderRadius: cssVar.borderRadiusLG,
  },
  style: {
    fontSize: 13,
  },
  style1: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

interface TotalCardProps {
  count: string | number;
  title: string;
}

const TotalCard = memo<TotalCardProps>(({ title, count }) => {
  const isDarkMode = useIsDark();
  const coloredStyle = {
    ...styles.colored,
    background: isDarkMode ? cssVar.colorFillTertiary : cssVar.colorFillQuaternary,
  };

  return (
    <Flexbox padding={12} style={coloredStyle}>
      <div style={styles.style}>{title}</div>
      <div style={styles.style1}>{count}</div>
    </Flexbox>
  );
});

export default TotalCard;
