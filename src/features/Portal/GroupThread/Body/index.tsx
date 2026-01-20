'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

import ThreadChatList from './ThreadChatList';

const styles = StyleSheet.create({
  style: {
    overflow: 'hidden',
    position: 'relative',
  },
});

const Body = memo(() => {
  return (
    <Flexbox height={'100%'}>
      <Flexbox flex={1} style={styles.style}>
        <ThreadChatList />
      </Flexbox>
    </Flexbox>
  );
});

export default Body;
