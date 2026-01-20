'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { memo } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { StyleSheet } from '@/utils/styles';

import Avatar from './Avatar';

const styles = StyleSheet.create({
  style: {
    overflow: 'hidden',
  },
});

const HeaderInfo = memo(() => {
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const title = useAgentStore(agentSelectors.currentAgentTitle);

  const displayTitle = isInbox ? 'Lobe AI' : title;

  return (
    <Flexbox align={'center'} flex={1} gap={8} horizontal style={styles.style}>
      <Avatar />
      <Text ellipsis weight={500}>
        {displayTitle}
      </Text>
    </Flexbox>
  );
});

export default HeaderInfo;
