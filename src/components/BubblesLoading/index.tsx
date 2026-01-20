import { Center } from '@lobehub/ui';
import { LoadingDots } from '@lobehub/ui/chat';
import { cssVar } from 'antd-style';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    height: 24,
    width: 32,
  },
});

const BubblesLoading = memo(() => {
  return (
    <Center style={styles.style}>
      <LoadingDots color={cssVar.colorTextSecondary} size={12} variant={'pulse'} />
    </Center>
  );
});

export default BubblesLoading;
