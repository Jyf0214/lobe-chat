'use client';

import { Flexbox, Skeleton } from '@lobehub/ui';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

import WideScreenContainer from '../../WideScreenContainer';

const styles = StyleSheet.create({
  flexContainer: {
    alignItems: 'flex-end',
  },
  spacing: {
    marginTop: 24,
  },
  spacing1: {
    paddingLeft: '25%',
  },
});

const SkeletonList = memo(() => {
  return (
    <WideScreenContainer flex={1} gap={36} height={'100%'} padding={12} style={styles.spacing}>
      {/* User Message */}
      <Flexbox gap={8} style={styles.spacing1} width={'100%'}>
        <Skeleton.Paragraph active rows={3} style={styles.flexContainer} />
      </Flexbox>

      {/* Assistant Message */}
      <Flexbox gap={8} width={'100%'}>
        <Skeleton
          active
          avatar={{
            shape: 'square',
            size: 28,
          }}
          paragraph={false}
        />
        <Skeleton.Paragraph />
        <Skeleton.Tags count={2} />
      </Flexbox>

      {/* Assistant Message */}
      <Flexbox gap={8} width={'100%'}>
        <Skeleton
          active
          avatar={{
            shape: 'square',
            size: 28,
          }}
          paragraph={false}
        />
        <Skeleton.Paragraph />
        <Skeleton.Tags count={2} />
      </Flexbox>
    </WideScreenContainer>
  );
});

export default SkeletonList;
