'use client';

import { Block } from '@lobehub/ui';
import { memo } from 'react';

import SupervisorAvatar from '@/app/[variants]/(main)/group/features/GroupAvatar';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    overflow: 'hidden',
  },
});

const HeaderAvatar = memo<{ size?: number }>(() => {
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
      <SupervisorAvatar size={28} />
    </Block>
  );
});

export default HeaderAvatar;
