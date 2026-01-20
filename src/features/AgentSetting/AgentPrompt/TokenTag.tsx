import { Tag } from '@lobehub/ui';
import React, { memo } from 'react';

import { useTokenCount } from '@/hooks/useTokenCount';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    marginTop: 24,
    width: 'fit-content',
  },
});

const Tokens = memo<{ style?: React.CSSProperties; value: string }>(({ value }) => {
  const systemTokenCount = useTokenCount(value);
  if (!value || !systemTokenCount) return;

  return <Tag style={styles.spacing}>Token: {systemTokenCount}</Tag>;
});

export default Tokens;
