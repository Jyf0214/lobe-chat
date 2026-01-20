import { Skeleton } from '@lobehub/ui';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    borderRadius: 8,
    height: 68,
  },
});

interface SkeletonLoadingProps {
  count?: number;
}

const SkeletonLoading = memo<SkeletonLoadingProps>(({ count = 3 }) => {
  return Array.from({ length: count }).map((key, index) => (
    <Skeleton.Button active block key={`${key}-${index}`} style={styles.style} />
  ));
});

export default SkeletonLoading;
