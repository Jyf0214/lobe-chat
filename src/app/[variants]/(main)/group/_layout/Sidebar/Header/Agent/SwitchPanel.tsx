import { Flexbox, Popover } from '@lobehub/ui';
import React, { type PropsWithChildren, Suspense, memo } from 'react';
import { useNavigate } from 'react-router-dom';

import List from '@/app/[variants]/(main)/home/_layout/Body/Agent/List';
import { AgentModalProvider } from '@/app/[variants]/(main)/home/_layout/Body/Agent/ModalProvider';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    maxHeight: '50vh',
    overflowY: 'auto',
  },
});

const SwitchPanel = memo<PropsWithChildren>(({ children }) => {
  const navigate = useNavigate();
  return (
    <Popover
      content={
        <Suspense fallback={<SkeletonList rows={6} />}>
          <AgentModalProvider>
            <Flexbox gap={4} padding={8} style={styles.style}>
              <List onMoreClick={() => navigate('/')} />
            </Flexbox>
          </AgentModalProvider>
        </Suspense>
      }
      placement="bottomLeft"
      styles={{
        content: {
          padding: 0,
          width: 240,
        },
      }}
      trigger="click"
    >
      {children}
    </Popover>
  );
});

export default SwitchPanel;
