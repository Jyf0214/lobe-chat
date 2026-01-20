'use client';

import { Flexbox, Skeleton } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';

import ListLoading from '@/app/[variants]/(main)/community/components/ListLoading';
import { StyleSheet } from '@/utils/styles';

import Banner from './features/Header/Banner';

const styles = StyleSheet.create({
  flexContainer: {
    boxShadow: `0 0 0 4px ${cssVar.colorBgContainer}`,
    flexShrink: 0,
  },
});

const Loading = memo(() => {
  return (
    <Flexbox gap={24} width={'100%'}>
      {/* User Header Skeleton */}
      <Banner />
      <Flexbox gap={16}>
        <Skeleton.Avatar shape={'square'} size={64} style={styles.flexContainer} />
        <Skeleton paragraph={{ rows: 1 }} />
      </Flexbox>

      {/* Agent List Skeleton */}
      <ListLoading length={4} rows={4} />
    </Flexbox>
  );
});

export default Loading;
