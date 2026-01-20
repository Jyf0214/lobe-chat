'use client';

import { Avatar, Block } from '@lobehub/ui';
import { memo } from 'react';

import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    overflow: 'hidden',
  },
});

const HeaderAvatar = memo(() => {
  const [avatar, backgroundColor] = useAgentStore((s) => [
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentBackgroundColor(s),
  ]);

  const openChatSettings = useOpenChatSettings();

  return (
    <Block
      clickable
      flex={'none'}
      height={32}
      onClick={(e) => {
        e.stopPropagation();
        openChatSettings();
      }}
      padding={2}
      style={styles.style}
      variant={'borderless'}
      width={32}
    >
      <Avatar avatar={avatar} background={backgroundColor} size={28} />
    </Block>
  );
});

export default HeaderAvatar;
