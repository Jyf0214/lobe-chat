'use client';

import { Skeleton } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  styleBase: {
    borderRadius: cssVar.borderRadiusLG,
    opacity: 0.5,
  },
});

export const GroupSkeleton = memo<{
  height?: number | string;
  rows?: number;
  width?: number | string;
}>(({ rows = 12, width, height }) => {
  const dynamicStyle = {
    ...styles.styleBase,
    height: height,
    maxHeight: height,
    maxWidth: width,
    minWidth: width,
  };

  return Array.from({ length: rows }).map((_, i) => (
    <Skeleton.Button active key={i} size={'large'} style={dynamicStyle} />
  ));
});

export default GroupSkeleton;
