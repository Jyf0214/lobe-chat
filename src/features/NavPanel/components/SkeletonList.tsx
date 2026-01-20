'use client';

import { Flexbox, type FlexboxProps, Skeleton } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    borderRadius: cssVar.borderRadius,
    height: 16,
    margin: 0,
    maxHeight: 16,
    opacity: 0.5,
    padding: 0,
  },
  style: {
    borderRadius: cssVar.borderRadius,
    height: 28,
    maxHeight: 28,
    maxWidth: 28,
    minWidth: 28,
  },
});

export const SkeletonItem = memo<{ avatarSize?: number } & Omit<FlexboxProps, 'children'>>(
  ({ padding = 6, height = 36, style, avatarSize = 28, ...rest }) => {
    return (
      <Flexbox
        align={'center'}
        flex={1}
        gap={8}
        height={height}
        horizontal
        padding={padding}
        style={style}
        {...rest}
      >
        <Skeleton.Button
          size={'small'}
          style={{
            ...styles.style,
            height: avatarSize,
            maxHeight: avatarSize,
            maxWidth: avatarSize,
            minWidth: avatarSize,
          }}
        />
        <Flexbox flex={1} height={16}>
          <Skeleton.Button active block size={'small'} style={styles.spacing} />
        </Flexbox>
      </Flexbox>
    );
  },
);

export const SkeletonList = memo<{ rows?: number } & Omit<FlexboxProps, 'children'>>(
  ({ rows = 3, ...rest }) => {
    return (
      <Flexbox gap={2} {...rest}>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonItem key={i} />
        ))}
      </Flexbox>
    );
  },
);

export default SkeletonList;
