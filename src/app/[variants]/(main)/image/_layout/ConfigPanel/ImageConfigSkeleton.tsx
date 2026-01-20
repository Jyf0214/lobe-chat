'use client';

import { Flexbox, Skeleton } from '@lobehub/ui';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  fullWidth1: {
    borderRadius: 8,
    height: 100,
    width: '100%',
  },
  spacing: {
    marginTop: 'auto',
  },
  style: {
    height: '100%',
  },
  style1: {
    width: 100,
  },
  style2: {
    width: 60,
  },
  style3: {
    width: 80,
  },
});

/**
 * Skeleton loading state for image configuration panel
 * Provides visual feedback during initialization
 */
const ImageConfigSkeleton = memo(() => {
  return (
    <Flexbox gap={32} padding="12px 12px 0 12px" style={styles.style}>
      {/* Model Selection */}
      <Flexbox gap={8}>
        <Skeleton.Button active size="small" style={styles.style1} />
        <Skeleton.Button active size="large" style={styles.fullWidth} />
      </Flexbox>

      {/* Image Upload Area */}
      <Flexbox gap={8}>
        <Skeleton.Button active size="small" style={styles.style2} />
        <Skeleton.Block active style={styles.fullWidth1} />
      </Flexbox>

      {/* Parameter Controls */}
      {Array.from({ length: 2 }, (_, index) => (
        <Flexbox gap={8} key={index}>
          <Skeleton.Button active size="small" style={styles.style3} />
          <Skeleton.Button active size="default" style={styles.fullWidth} />
        </Flexbox>
      ))}

      {/* Image Number Control (Sticky at bottom) */}
      <Flexbox padding="12px 0" style={styles.spacing}>
        <Flexbox gap={8}>
          <Skeleton.Button active size="small" style={styles.style2} />
          <Skeleton.Button active size="default" style={styles.fullWidth} />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

ImageConfigSkeleton.displayName = 'ImageConfigSkeleton';

export default ImageConfigSkeleton;
