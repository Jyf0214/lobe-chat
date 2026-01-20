'use client';

import { Flexbox, Skeleton } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

import Nav from './features/Details/Nav';

const styles = StyleSheet.create({
  style: {
    height: 36,
    width: 200,
  },
  style1: {
    width: 200,
  },
  style2: {
    overflow: 'hidden',
  },
});

const Loading = memo(() => {
  const { mobile } = useResponsive();
  return (
    <Flexbox gap={24}>
      <Flexbox gap={12}>
        <Flexbox align={'center'} gap={16} horizontal width={'100%'}>
          <Skeleton.Avatar active shape={'square'} size={mobile ? 48 : 64} />
          <Skeleton.Button active style={styles.style} />
        </Flexbox>
        <Skeleton.Button size={'small'} style={styles.style1} />
      </Flexbox>
      <Nav />
      <Flexbox
        gap={48}
        horizontal={!mobile}
        style={mobile ? { flexDirection: 'column-reverse' } : undefined}
      >
        <Flexbox flex={1} gap={16} style={styles.style2} width={'100%'}>
          <Skeleton paragraph={{ rows: 3 }} title={false} />
          <Skeleton paragraph={{ rows: 8 }} title={false} />
          <Skeleton paragraph={{ rows: 8 }} title={false} />
        </Flexbox>
        <Flexbox gap={16} width={360}>
          <Skeleton paragraph={{ rows: 3 }} title={false} />
          <Skeleton paragraph={{ rows: 4 }} title={false} />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default Loading;
