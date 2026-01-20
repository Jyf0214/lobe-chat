import { Flexbox, Skeleton } from '@lobehub/ui';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 'none',
  },
  style: {
    overflow: 'hidden',
  },
  style1: {
    height: 16,
    width: '70%',
  },
  style2: {
    height: 12,
    width: '50%',
  },
});

const LoadingList = () => {
  const loadingItem = {
    avatar: <Skeleton.Avatar active shape="square" size={40} style={styles.flexContainer} />,
    label: (
      <Flexbox flex={1} gap={6} style={styles.style}>
        <Skeleton.Button active size={'small'} style={styles.style1} />
        <Skeleton.Button active size={'small'} style={styles.style2} />
      </Flexbox>
    ),
  };

  return [loadingItem, loadingItem, loadingItem];
};

export default LoadingList;
