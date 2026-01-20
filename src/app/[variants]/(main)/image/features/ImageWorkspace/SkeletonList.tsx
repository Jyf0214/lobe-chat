'use client';

import { Block, Center, Flexbox, Grid, Skeleton } from '@lobehub/ui';
import { memo } from 'react';

import PromptInput from '@/app/[variants]/(main)/image/features/PromptInput';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  fullWidth1: {
    height: 200,
    width: '100%',
  },
  fullWidth2: {
    bottom: 24,
    position: 'sticky',
    width: '100%',
  },
  style: {
    minHeight: 'calc(100vh - 44px)',
  },
  style1: {
    height: 20,
    width: '95%',
  },
  style2: {
    height: 16,
    width: 120,
  },
  style3: {
    height: 16,
    width: 80,
  },
  style4: {
    height: 16,
    width: 60,
  },
  style5: {
    height: 16,
    width: 70,
  },
});

const SkeletonList = memo(() => {
  return (
    <Flexbox style={styles.style}>
      <Block variant={'borderless'}>
        <Flexbox gap={12}>
          {/* Prompt text skeleton */}
          <Skeleton.Button active style={styles.style1} />

          {/* Metadata skeleton */}
          <Flexbox gap={12} horizontal style={styles.fullWidth}>
            <Skeleton.Button active style={styles.style2} />
            <Skeleton.Button active style={styles.style3} />
            <Skeleton.Button active style={styles.style4} />
            <Skeleton.Button active style={styles.style5} />
          </Flexbox>

          {/* Image grid skeleton - 2x2 layout */}
          <Grid maxItemWidth={200} rows={4} width={'100%'}>
            {Array.from({ length: 4 }).map((_, imageIndex) => (
              <Skeleton.Button active key={imageIndex} style={styles.fullWidth1} />
            ))}
          </Grid>
        </Flexbox>
      </Block>
      <div style={styles.flexContainer} />
      <Center style={styles.fullWidth2}>
        <PromptInput disableAnimation={true} showTitle={false} />
      </Center>
    </Flexbox>
  );
});

SkeletonList.displayName = 'SkeletonList';

export default SkeletonList;
